import {
  Actions,
  IExtractPoolData,
  IExtractPoolV2Data,
  IPoolV3ContractData,
  IPoolV4ContractData,
} from '@gamify/onchain-program-sdk';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {PublicKey} from '@solana/web3.js';
import Decimal from 'decimal.js';
import {Response} from 'express';
import {Parser} from 'json2csv';
import {isPoolV2Version, isPoolV3Version, isPoolV4Version} from 'src/shared/helper';
import {PaginateQuery} from 'src/shared/interface';
import {getConnection} from 'src/shared/utils/connection';
import {PoolsService} from '../pools/pools.service';
import {CreateJoinPoolHistory, UpdateJoinPoolHistoryStatus} from './dto/join-pool-history.dto';
import {JoinPoolHistoryRepository} from './join-pool-history.repository';
import {JoinPoolStatusEnum} from './pool-participants.enum';
import {PoolParticipantsRepository} from './pool-participants.repository';

const connection = getConnection();

@Injectable()
export class PoolParticipantsService {
  private actions: Actions;

  constructor(
    private readonly poolParticipantsRepository: PoolParticipantsRepository,
    private readonly joinPoolHistoryRepository: JoinPoolHistoryRepository,
    @Inject(forwardRef(() => PoolsService))
    private readonly poolsService: PoolsService,
  ) {
    this.actions = new Actions(connection);
  }

  async userJoinPool(dto: CreateJoinPoolHistory) {
    const pool = await this.poolsService.findOneWithCondition({contract_address: dto.pool_address});
    if (!pool) {
      return {
        success: false,
        message: 'Pool not found when join',
      };
    }
    const dataInput = {...dto, status: JoinPoolStatusEnum.Pending, pool_id: pool._id};

    return this.joinPoolHistoryRepository.create(dataInput);
  }

  async updateJoinPoolHistory(id: string, dto: UpdateJoinPoolHistoryStatus) {
    return this.joinPoolHistoryRepository.updateById(
      id,
      {
        status: dto.status,
      },
      {new: true},
    );
  }

  async indexUserJoinPoolHistory(
    params: PaginateQuery & {user_address?: string; pool_address?: string},
    needAll: boolean = false,
  ) {
    return this.joinPoolHistoryRepository.paginate(
      {
        page: params.page,
        limit: params.limit,
        user_address: params.user_address,
        pool_address: params.pool_address,
      },
      needAll,
    );
  }

  async exportParticipants(poolAddress: string, res: Response) {
    if (!poolAddress) {
      throw new BadRequestException('Pool address is required.');
    }

    const participants = await this.poolParticipantsRepository.find({pool_address: poolAddress});

    const data = participants.map((item) => ({
      user_address: item.user_address,
      associated_address: item.participant_address,
      amount: item.amount,
      created_at: item?.createdAt,
    }));

    const fields = [
      {
        label: 'User address',
        value: 'user_address',
      },
      {
        label: 'Amount',
        value: 'amount',
      },
      {
        label: 'Created At',
        value: 'created_at',
      },
    ];

    const json2csv = new Parser({fields});
    const csv = json2csv.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(`Pool Participants ${poolAddress}`);

    return res.send(csv);
  }

  async verifyParticipantsProgress(poolAddress: string): Promise<{progress: number | null}> {
    if (!poolAddress) {
      throw new BadRequestException('Pool address is required.');
    }

    const currentVerified = await this.poolParticipantsRepository.count({
      pool_address: poolAddress,
    });

    let poolFullInfo:
      | IExtractPoolData
      | IExtractPoolV2Data
      | IPoolV3ContractData
      | IPoolV4ContractData;

    try {
      poolFullInfo = await this.actions.readPool(new PublicKey(poolAddress));
    } catch (err) {
      throw new InternalServerErrorException('Can not read onchain pool');
    }

    const poolEndTime = new Date(poolFullInfo.campaign.public_phase.end_at).getTime();
    const now = new Date().getTime();
    if (poolEndTime > now) {
      return {
        progress: null,
      };
    }

    let participants =
      poolFullInfo.campaign.early_join_phase.number_joined_user +
      poolFullInfo.campaign.public_phase.number_joined_user;

    if (
      isPoolV2Version(poolFullInfo) ||
      isPoolV3Version(poolFullInfo) ||
      isPoolV4Version(poolFullInfo)
    ) {
      participants += poolFullInfo.campaign.exclusive_phase.number_joined_user;
    }
    if (isPoolV3Version(poolFullInfo) || isPoolV4Version(poolFullInfo)) {
      participants += poolFullInfo.campaign.fcfs_stake_phase.number_joined_user;
    }

    return {
      progress: parseFloat(
        new Decimal(currentVerified).times(100).dividedBy(participants).toFixed(2),
      ),
    };
  }
}
