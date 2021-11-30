import {Actions, ICommonSetting} from '@gamify/onchain-program-sdk';
import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import * as httpContext from 'express-http-context';
import {isValidObjectId, PaginateModel} from 'mongoose';
import {Pool, PoolDocument} from 'src/modules/pools/pools.schema';
import {ADDRESS} from 'src/shared/constants';
import {getConnection} from 'src/shared/utils/connection';

@Injectable()
export class PoolOwnerGuard implements CanActivate {
  constructor(@InjectModel(Pool.name) private readonly model: PaginateModel<PoolDocument>) {}
  async canActivate(context: ExecutionContext) {
    const address = httpContext.get(ADDRESS);
    if (!address) {
      return false;
    }

    const poolId = context.switchToHttp().getRequest().params.id;
    let pool;

    if (isValidObjectId(poolId)) {
      pool = await this.model.findById(poolId);
    } else {
      pool = await this.model.findOne({pool_address: poolId});
    }

    let commonSetting: ICommonSetting = await new Actions(
      getConnection(),
    ).readCommonSettingByProgramId();
    return pool?.data?.admins?.root_admin === address || address === (await commonSetting).admin;
  }
}
