import {Document} from 'mongoose';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

export type PlatformDocument = Platform & Document;

@Schema({timestamps: true})
export class Platform {
  @Prop({required: true})
  publicKey: string;

  @Prop({required: true})
  secretKey: string;

  @Prop()
  programId?: string;
}

export const PlatformSchema = SchemaFactory.createForClass(Platform).index({
  poolAccount: 1,
  programId: 1,
});
