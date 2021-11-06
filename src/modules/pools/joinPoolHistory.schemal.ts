import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import * as MongooseFuzzySearching from 'mongoose-fuzzy-searching';
import {BaseDocument, EmbeddedDocument} from '../../shared/base.document';
import {IToken} from './pools.interface';

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
}

export const JoinPoolHistorySchema = SchemaFactory.createForClass(JoinPoolHistory).index({name: 1});
