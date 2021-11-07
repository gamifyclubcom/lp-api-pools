import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {BaseDocument, EmbeddedDocument} from 'src/shared/base.document';
import {UserStakeActionType} from './constants';

export type UserStakeHistoryDocument = UserStakeHistory & BaseDocument;

@Schema({timestamps: true})
export class UserStakeHistory {
  @Prop({required: true})
  user_address: string;

  @Prop({required: false})
  stake_member_acount?: string;

  @Prop({required: true})
  stake_acount: string;

  @Prop({required: true})
  amount: number;

  @Prop({required: true, enum: UserStakeActionType})
  action_type: UserStakeActionType;
}

export const UserStakeHistorySchema = SchemaFactory.createForClass(UserStakeHistory).index({
  user_address: 1,
  action_type: 1,
});
