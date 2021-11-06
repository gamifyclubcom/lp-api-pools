import {BadRequestException, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import * as _ from 'lodash';
import {PaginateModel} from 'mongoose';
import {BaseService, paginate} from '../../shared/base.service';
import {getConnection} from '../../shared/utils/connection';
import {Parser} from 'json2csv';
import {Response} from 'express';
import {UserStakeHistory, UserStakeHistoryDocument} from './userStakeHistory.schemal';
import {CreateUserStakeHistory} from './dto/userStakeHisotry.dto';
import {Actions, CURRENT_STAKE_ACCOUNT} from '@intersola/onchain-program-sdk';
import {UserStakeActionType} from './constants';
import Decimal from 'decimal.js';
import {PublicKey} from '@solana/web3.js';
import {Logger} from 'nestjs-pino';

const connection = getConnection();

export class StakeService extends BaseService<UserStakeHistoryDocument> {
  constructor(
    @InjectModel(UserStakeHistory.name)
    private readonly userStakeHistory: PaginateModel<UserStakeHistoryDocument>,
    private readonly logger: Logger,
  ) {
    super();
  }

  public async createJoinPoolHistory(input: CreateUserStakeHistory): Promise<any> {
    const updateSuccess = await this.userStakeHistory.create({
      ...input,
      stake_acount: input.stake_account,
      amount:
        input.action_type === UserStakeActionType.STAKE
          ? input.amount
          : new Decimal(input.amount).negated().toNumber(),
      stake_member_acount:
        input.stake_member_acount ||
        (await new Actions(connection).findAssociatedStakeAddress(
          new PublicKey(input.user_address),
        )),
    });
    return {
      success: !!updateSuccess,
      message: updateSuccess ? 'Create success' : 'Create failed',
    };
  }

  public async exportJoinPoolHistory(res: Response, stake_account?: string) {
    const joinPoolHistories = await this.userStakeHistory.find({
      stake_acount: stake_account || CURRENT_STAKE_ACCOUNT,
    });

    const data = joinPoolHistories.map((item) => ({
      user_address: item.user_address,
      associated_addres: item.stake_member_acount,
      amount: item.amount,
      created_at: item?.createdAt,
    }));

    const fields = [
      {
        label: 'User address',
        value: 'user_address',
      },
      {
        label: 'Associated address',
        value: 'associated_addres',
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
    res.attachment(`user-stake-history-${CURRENT_STAKE_ACCOUNT}`);

    return res.send(csv);
  }

  public async readUserStakeData(userAddress: string) {
    const action = new Actions(connection);
    try {
      const user = await action.readStakeMember(new PublicKey(userAddress));
      if (!user) {
        throw new NotFoundException();
      }

      return {
        ...user,
        pubkey: user.pubkey.toString(),
        stake_account: user.stake_account.toString(),
        associated_account: (
          await action.findAssociatedStakeAddress(new PublicKey(userAddress))
        ).toString(),
      };
    } catch (error) {
      this.logger.error('readUserStakeData::error', error);
      throw new NotFoundException();
    }
  }
}
