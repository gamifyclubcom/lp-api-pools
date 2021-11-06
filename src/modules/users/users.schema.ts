import {Document} from 'mongoose';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as MongoosePaginate from 'mongoose-paginate-v2';
import * as MongooseFuzzySearching from 'mongoose-fuzzy-searching';

export type UserDocument = User & Document;

@Schema({timestamps: true})
export class User {
  @Prop()
  avatar: string;

  @Prop({required: true})
  address: string;

  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop()
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User)
  .plugin(MongoosePaginate)
  .plugin(MongooseFuzzySearching, {
    fields: ['first_name', 'last_name', 'email'],
  })
  .index({address: 1, email: 1});
