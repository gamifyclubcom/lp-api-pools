import {Actions} from '@intersola/onchain-program-sdk';
import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {PublicKey} from '@solana/web3.js';
import * as httpContext from 'express-http-context';
import {PaginateModel} from 'mongoose';
import {Pool, PoolDocument} from 'src/modules/pools/pools.schema';
import {ADDRESS} from 'src/shared/constants';
import {getConnection} from 'src/shared/utils/connection';

@Injectable()
export class PoolOwnerQueryGuard implements CanActivate {
  constructor(@InjectModel(Pool.name) private readonly model: PaginateModel<PoolDocument>) {}
  async canActivate(context: ExecutionContext) {
    const address = httpContext.get(ADDRESS);
    if (!address) {
      return false;
    }

    const poolId = context.switchToHttp().getRequest().query.poolId;
    const pool = await this.model.findById(poolId);
    const commonSetting = new Actions(getConnection()).readCommonSettingByProgramId(
      new PublicKey(pool.program_id),
    );
    return pool?.data?.admins?.root_admin === address || address === (await commonSetting).admin;
  }
}
