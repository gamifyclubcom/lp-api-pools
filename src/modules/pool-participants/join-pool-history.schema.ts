import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as MongoosePaginate from 'mongoose-paginate-v2';
import {BaseDocument} from '../../shared/base.document';
import {JoinPoolStatusEnum} from './pool-participants.enum';

export type JoinPoolHistoryDocument = JoinPoolHistory & BaseDocument;

@Schema({timestamps: true})
export class JoinPoolHistory {
  @Prop({required: true})
  user_address?: string;

  @Prop({required: false})
  participant_address?: string;

  @Prop({required: true})
  pool_id: string;

  @Prop({required: true})
  pool_address: string;

  @Prop({required: true})
  amount: number;

  @Prop({required: false, type: JoinPoolStatusEnum})
  status?: JoinPoolStatusEnum;
}

export const JoinPoolHistorySchema = SchemaFactory.createForClass(JoinPoolHistory)
  .index({name: 1})
  .plugin(MongoosePaginate);
