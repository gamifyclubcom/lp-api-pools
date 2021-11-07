import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {PoolsController} from './pools.controller';
import {Pool, PoolSchema} from './pools.schema';
import {PoolsService} from './pools.service';
import {Platform, PlatformSchema} from '../platform/platform.schema';
import {PlatformService} from '../platform/platform.service';
import {PlatformModule} from '../platform/platform.module';
import {PoolsAdminController} from './pools.admin.controller';
import {JoinPoolHistory, JoinPoolHistorySchema} from './joinPoolHistory.schemal';
import {ClaimTokenHistory, ClaimTokenHistorySchema} from './claimTokenHistory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Pool.name, schema: PoolSchema},
      {name: Platform.name, schema: PlatformSchema},
      {name: JoinPoolHistory.name, schema: JoinPoolHistorySchema},
      {name: ClaimTokenHistory.name, schema: ClaimTokenHistorySchema},
    ]),
    PlatformModule,
  ],
  controllers: [PoolsController, PoolsAdminController],
  providers: [PoolsService, PlatformService],
  exports: [PoolsService],
})
export default class PoolsModule {}
