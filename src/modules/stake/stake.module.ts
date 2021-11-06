import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UserStakeHistory, UserStakeHistorySchema} from './userStakeHistory.schemal';
import {UserStakeController} from './stake.user.controller';
import {StakeService} from './stake.service';
import { AdminStakeController } from './stake.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{name: UserStakeHistory.name, schema: UserStakeHistorySchema}]),
  ],
  controllers: [UserStakeController, AdminStakeController],
  providers: [StakeService],
  exports: [StakeService],
})
export default class StakeModule {}
