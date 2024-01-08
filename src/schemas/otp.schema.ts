import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

@Schema()
export class Otp {
  @Prop({type: String, default: null})
  email: string;

  @Prop({type: String, default: null})
  otp: string;

  @Prop({type: String, default: null})
  exipryTime: string;

  @Prop({type: Date, default: null})
  createdAt: Date;

  @Prop({type: Date, default: null})
  updatedAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);