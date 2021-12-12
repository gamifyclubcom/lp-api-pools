import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as MongoosePaginate from 'mongoose-paginate-v2';

@Schema({timestamps: true})
export class PoolParticipants {
  @Prop({required: true})
  pool_id: string;

  @Prop({required: false})
  participant_address?: string;

  @Prop({required: true})
  user_address: string;

  @Prop({required: true})
  pool_address: string;

  @Prop({required: true, type: Number})
  amount: string;

  @Prop({type: [String]})
  join_pool_history_ids?: string[];
}

export const PoolParticipantsSchema =
  SchemaFactory.createForClass(PoolParticipants).plugin(MongoosePaginate);
