import {Document} from 'mongoose';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

export type WhitelistDocument = Whitelist & Document;

@Schema({timestamps: true})
export class Whitelist {
  @Prop({required: true})
  poolId: string;

  @Prop({required: true})
  userAccount: string;

  @Prop({required: true})
  isWhitelisted: boolean;
}

export const WhitelistSchema = SchemaFactory.createForClass(Whitelist).index({
  poolAccount: 1,
});
