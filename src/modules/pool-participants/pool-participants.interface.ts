import {BaseDocument} from 'src/shared/base.document';
import {JoinPoolStatusEnum} from './pool-participants.enum';

export class IPoolParticipants extends BaseDocument {
  pool_id: string;
  participant_address?: string;
  user_address?: string;
  pool_address: string;
  amount: number;
  join_pool_history_ids?: string[];
}

export class IJoinPoolHistory extends BaseDocument {
  pool_id: string;
  participant_address?: string;
  user_address?: string;
  pool_address: string;
  amount: number;
  status?: JoinPoolStatusEnum;
}
