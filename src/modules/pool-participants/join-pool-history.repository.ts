import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {PaginateModel} from 'mongoose';
import {BaseRepository} from '../../shared/mongoose';
import {JoinPoolHistory} from './join-pool-history.schema';
import {IJoinPoolHistory} from './pool-participants.interface';

@Injectable()
export class JoinPoolHistoryRepository
  extends BaseRepository<IJoinPoolHistory>
  implements OnApplicationBootstrap
{
  constructor(
    @InjectModel(JoinPoolHistory.name) joinPoolHistoryModel: PaginateModel<IJoinPoolHistory>,
  ) {
    super(joinPoolHistoryModel);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
