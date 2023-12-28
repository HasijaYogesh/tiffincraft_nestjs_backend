import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({default: null})
  firstName: string;

  @Prop({default: null})
  lastName: string;

  @Prop({default: null})
  email: string;

  @Prop({default: null})
  countryCode: string;

  @Prop({default: null})
  phone: string;

  @Prop({default: null})
  password: string;

  @Prop({default: null})
  socialId: string;

  @Prop({default: null})
  socialAccessToken: string;

  @Prop({ type: Object })
  location: object;

  @Prop({default: null})
  userType: string; // Values in constant file
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({location: "2dsphere"});