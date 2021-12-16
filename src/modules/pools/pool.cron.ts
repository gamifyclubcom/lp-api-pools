import {Actions} from '@gamify/onchain-program-sdk';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Cron, CronExpression, SchedulerRegistry} from '@nestjs/schedule';
import {CronJob} from 'cron';
import {PaginateModel} from 'mongoose';
import {v4 as uuid} from 'uuid';
import {getConnection} from '../../shared/utils/connection';
import {JoinPoolHistoryRepository} from '../pool-participants/join-pool-history.repository';
import {PoolParticipantsRepository} from '../pool-participants/pool-participants.repository';
import {Pool, PoolDocument} from './pools.schema';
import {PoolsService} from './pools.service';

const connection = getConnection();

@Injectable()
export class PoolCron {
  actions: Actions;

  constructor(
    @InjectModel(Pool.name) private readonly poolModel: PaginateModel<PoolDocument>,
    private readonly joinPoolHistoryRepository: JoinPoolHistoryRepository,
    private readonly poolParticipantsRepository: PoolParticipantsRepository,
    private readonly poolsService: PoolsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.actions = new Actions(connection);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateDataParticipants() {
    const now = new Date();
    const poolsNotFinalize = await this.poolModel.find({
      'flags.is_finalize_participants': false,
      'flags.is_cron_running': false,
    });

    console.log('Pool cron is running');

    if (poolsNotFinalize.length > 0) {
      poolsNotFinalize.map((pool) => {
        this.poolsService.addJobFinalizePool(pool);
      });
    }
  }
}
