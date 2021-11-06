import {Actions, PoolMemberAccountLayout} from '@intersola/onchain-program-sdk';
import {BadRequestException, Injectable} from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { getConnection } from '../../shared/utils/connection';
import { IPool } from '../pools/pools.interface';
import { PoolsService } from '../pools/pools.service';
import { ReadPoolUserDto } from './poolMembers.dto';
const connection = getConnection();

@Injectable()
export class PoolMembersService {
  action: Actions;
  constructor(
    private readonly poolsService: PoolsService,
  ) {
    this.action = new Actions(connection);
  }

  /**
   * @param poolId
   * @param userAccount
   */
  async readPoolUserAccount(poolId: string, userAccount: string) {
    const pool: IPool = await this.poolsService.findOne(poolId);
    if (!pool) {
      throw new Error('Pool is not found');
    }

    const userPoolAccount = await this.action.findAssociatedPoolAddress(new PublicKey(userAccount), new PublicKey(pool.contract_address));
    const userPoolAccountData = await connection.getAccountInfo(new PublicKey(userPoolAccount));

    let decodedData = null;
    if (!userPoolAccountData?.data) {
      // do nothing
    } else {
      decodedData = PoolMemberAccountLayout.decode(userPoolAccountData.data);
    }


    return {
      userAccount,
      userPoolAssociatedAccount: userPoolAccount.toBase58(),
      exchangedTokenAmount: decodedData?.exchanged_token_y_amount || 0,
      isWhitelisted: decodedData?.is_whitelisted || false,
      isPoolAssociatedAccountCreated: !!decodedData
    };
  }
}
