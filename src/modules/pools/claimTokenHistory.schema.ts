import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

@Schema({timestamps: true})
export class ClaimTokenHistory {
  @Prop({required: true})
  user_address: string;

  @Prop({required: true})
  pool_address: string;

  @Prop({required: true})
  token_address: string;

  @Prop({required: true, type: Date})
  claimed_at: Date;

  @Prop({required: true, type: Boolean})
  is_claimed: boolean;
}

export type ClaimTokenHistoryDocument = ClaimTokenHistory & Document;

export const ClaimTokenHistorySchema = SchemaFactory.createForClass(ClaimTokenHistory).index({
  user_address: 1,
  pool_address: 1,
  token_address: 1,
});
