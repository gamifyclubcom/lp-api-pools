import {Actions, ICommonSetting} from '@gamify/onchain-program-sdk';
import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {PublicKey} from '@solana/web3.js';
import * as httpContext from 'express-http-context';
import {PaginateModel} from 'mongoose';
import {Pool, PoolDocument} from '../modules/pools/pools.schema';
import {ADDRESS} from '../shared/constants';
import {getConnection} from '../shared/utils/connection';

@Injectable()
export class PoolOwnerBodyGuard implements CanActivate {
  constructor(@InjectModel(Pool.name) private readonly model: PaginateModel<PoolDocument>) {}
  async canActivate(context: ExecutionContext) {
    const address = httpContext.get(ADDRESS);
    if (!address) {
      return false;
    }

    const poolId = context.switchToHttp().getRequest().body.poolId;
    const pool = await this.model.findById(poolId);

    let commonSetting: ICommonSetting;

    if (pool.data.version < 4) {
      commonSetting = await new Actions(getConnection()).readCommonSettingByProgramId();
    } else {
      commonSetting = await new Actions(getConnection()).readCommonSettingByProgramId(
        new PublicKey(pool.program_id),
      );
    }

    return pool?.data?.admins?.root_admin === address || address === (await commonSetting).admin;
  }
}
