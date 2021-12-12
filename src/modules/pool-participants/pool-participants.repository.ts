import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {PaginateModel} from 'mongoose';
import {BaseRepository} from 'src/shared/mongoose';
import {IPoolParticipants} from './pool-participants.interface';
import {PoolParticipants} from './pool-participants.schema';

@Injectable()
export class PoolParticipantsRepository
  extends BaseRepository<IPoolParticipants>
  implements OnApplicationBootstrap
{
  constructor(
    @InjectModel(PoolParticipants.name)
    poolParticipantsModel: PaginateModel<IPoolParticipants>,
  ) {
    super(poolParticipantsModel);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
