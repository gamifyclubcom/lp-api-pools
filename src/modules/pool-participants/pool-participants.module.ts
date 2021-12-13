import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import PoolsModule from '../pools/pools.module';
import {JoinPoolHistoryController} from './join-pool-history.controller';
import {JoinPoolHistoryRepository} from './join-pool-history.repository';
import {JoinPoolHistory, JoinPoolHistorySchema} from './join-pool-history.schema';
import {PoolParticipantsController} from './pool-participants.controller';
import {PoolParticipantsRepository} from './pool-participants.repository';
import {PoolParticipants, PoolParticipantsSchema} from './pool-participants.schema';
import {PoolParticipantsService} from './pool-participants.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: PoolParticipants.name, schema: PoolParticipantsSchema},
      {name: JoinPoolHistory.name, schema: JoinPoolHistorySchema},
    ]),
    forwardRef(() => PoolsModule),
  ],
  controllers: [JoinPoolHistoryController, PoolParticipantsController],
  providers: [PoolParticipantsService, JoinPoolHistoryRepository, PoolParticipantsRepository],
  exports: [PoolParticipantsService, JoinPoolHistoryRepository, PoolParticipantsRepository],
})
export class PoolParticipantsModule {}
