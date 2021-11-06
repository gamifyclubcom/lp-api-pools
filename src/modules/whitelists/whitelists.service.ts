import {Actions} from '@gamify/onchain-program-sdk';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {PublicKey} from '@solana/web3.js';
import {PaginateModel} from 'mongoose';
import {paginationConfig} from '../../configs';
import {getConnection} from '../../shared/utils/connection';
import {paginate} from '../../shared/base.service';
import {PaginateResponse} from '../../shared/interface';
import {IPool} from '../pools/pools.interface';
import {PoolsService} from '../pools/pools.service';
import {RemoveWhitelistUserDto, SetWhitelistUserDto, WhitelistsFilterInput} from './whitelists.dto';
import {Whitelist, WhitelistDocument} from './whitelists.schema';

const connection = getConnection();

@Injectable()
export class WhitelistsService {
  action: Actions;
  constructor(
    private readonly poolsService: PoolsService,
    @InjectModel(Whitelist.name) private readonly model: PaginateModel<WhitelistDocument>,
  ) {
    this.action = new Actions(connection);
  }

  /**
   * Mark user is whitelisted
   * @param input
   */
  async addUserToWhitelist(input: SetWhitelistUserDto) {
    const pool: IPool = await this.poolsService.findOne(input.poolId);
    if (!pool) {
      throw new Error('Pool is not found');
    }

    await this.recordWhitelistData({
      isWhitelisted: true,
      pooldId: input.poolId,
      userAccount: input.userAccount,
    });

    return {
      ok: true,
    };
  }

  async addBatchUserToWhitelist(input: SetWhitelistUserDto) {
    const pool: IPool = await this.poolsService.findOne(input.poolId);
    if (!pool) {
      throw new Error('Pool is not found');
    }

    const whitelists = await this.model.find({poolId: input.poolId});
    const listAccounts = whitelists.map((account) => account.userAccount);
    const userAccounts = [];
    input.userAccount.forEach((account) => {
      if (!listAccounts.includes(account)) {
        userAccounts.push(account);
      }
    });
    await this.model.insertMany(
      userAccounts.map((item) => ({
        poolId: input.poolId,
        userAccount: item,
        isWhitelisted: true,
      })),
    );

    return {
      ok: true,
    };
  }

  async checkAndAddMissing(input: SetWhitelistUserDto) {
    const pool: IPool = await this.poolsService.findOne(input.poolId);
    if (!pool) {
      throw new NotFoundException('Pool is not found');
    }
    const poolAddress = pool.contract_address && new PublicKey(pool.contract_address);

    const userAccounts = input.userAccount;
    if (userAccounts?.length < 1) {
      throw new BadRequestException('You must pass at least 1 account address to check');
    }
    if (userAccounts.length > 12) {
      throw new BadRequestException('You can only check with 12 accounts maximum.');
    }

    const whitelists = await this.model.find({
      poolId: input.poolId,
      isWhitelisted: true,
      userAccount: {$in: userAccounts},
    });
    const accountWhitelisted = whitelists.map((account) => account.userAccount);
    const accountsNeedInsert = [];
    try {
      for (let i = 0; i < userAccounts.length; i++) {
        const isWhitelisted = await this.action.isAccountWhitelisted(
          new PublicKey(userAccounts[i]),
          poolAddress,
        );
        if (isWhitelisted && !accountWhitelisted.includes(userAccounts[i])) {
          accountsNeedInsert.push(userAccounts[i]);
        }
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }

    await this.model.deleteMany({
      poolId: input.poolId,
      userAccount: {$in: accountsNeedInsert},
    });
    await this.model.insertMany(
      accountsNeedInsert.map((item) => ({
        poolId: input.poolId,
        userAccount: item,
        isWhitelisted: true,
      })),
    );

    return {
      success: true,
      accountsInserted: accountsNeedInsert,
      total: accountsNeedInsert.length,
    };
  }

  /**
   * Remove user from whitelist
   * @param input
   */
  async removeUserToWhitelist(input: RemoveWhitelistUserDto) {
    const pool: IPool = await this.poolsService.findOne(input.poolId);
    if (!pool) {
      throw new Error('Pool is not found');
    }
    await this.model.deleteMany({userAccount: {$in: input.userAccounts}, poolId: input.poolId});

    return {
      ok: true,
    };
  }

  /**
   * Record whitelist data to database
   * @param input
   */
  public async recordWhitelistData(input: {userAccount; pooldId; isWhitelisted}) {
    let result;
    const existed = await this.model
      .findOne({
        poolId: input.pooldId,
        userAccount: input.userAccount,
      })
      .exec();
    if (!existed) {
      result = await this.model.create({
        poolId: input.pooldId,
        userAccount: input.userAccount,
        isWhitelisted: input.isWhitelisted,
      });
    } else {
      result = await this.model.updateOne(
        {
          poolId: input.pooldId,
          userAccount: input.userAccount,
        },
        {
          poolId: input.pooldId,
          userAccount: input.userAccount,
          isWhitelisted: input.isWhitelisted,
        },
      );
    }

    return result;
  }

  public async index(
    filters?: WhitelistsFilterInput,
  ): Promise<PaginateResponse<WhitelistDocument>> {
    if (!filters.poolId) {
      throw new BadRequestException('Missing poolId parameter');
    }
    const page = filters.page
      ? parseInt(filters.page.toString(), 10)
      : paginationConfig.DEFAULT_PAGE;
    const limit = filters.limit
      ? parseInt(filters.limit.toString(), 10)
      : paginationConfig.DEFAULT_LIMIT;

    let options: any = {};

    const pool: IPool = await this.poolsService.findOne(filters.poolId);
    if (!pool) {
      throw new Error('Pool is not found when fetch whitelist');
    }
    options = {
      ...options,
      ...(filters.poolId && {poolId: filters.poolId}),
      ...(filters.userAccount && {userAccount: filters.userAccount}),
    };

    const docs: any = await this.model
      .find(options)
      .sort({createdAt: 1})
      .limit(limit)
      .skip(limit * page);
    const totalDocs: number = await this.model.count(options);

    const paginated = paginate({page, limit, docs, totalDocs});

    return paginated;
  }
}
