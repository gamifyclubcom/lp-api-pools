import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {PoolsController} from './pools.controller';
import {Pool, PoolSchema} from './pools.schema';
import {PoolsService} from './pools.service';
import {Platform, PlatformSchema} from '../platform/platform.schema';
import {PlatformService} from '../platform/platform.service';
import {PlatformModule} from '../platform/platform.module';
import {PoolsAdminController} from './pools.admin.controller';
import {ClaimTokenHistory, ClaimTokenHistorySchema} from './claimTokenHistory.schema';
import {PoolParticipantsModule} from '../pool-participants/pool-participants.module';
import {
  JoinPoolHistory,
  JoinPoolHistorySchema,
} from '../pool-participants/join-pool-history.schema';
import {PoolCron} from './pool.cron';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Pool.name, schema: PoolSchema},
      {name: Platform.name, schema: PlatformSchema},
      {name: JoinPoolHistory.name, schema: JoinPoolHistorySchema},
      {name: ClaimTokenHistory.name, schema: ClaimTokenHistorySchema},
    ]),
    PlatformModule,
    PoolParticipantsModule,
  ],
  controllers: [PoolsController, PoolsAdminController],
  providers: [PoolsService, PlatformService, PoolCron],
  exports: [PoolsService],
})
export default class PoolsModule {}
