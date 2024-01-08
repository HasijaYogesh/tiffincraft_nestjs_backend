import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({type: String, default: null})
  firstName: string;

  @Prop({type: String, default: null})
  lastName: string;

  @Prop({type: String, default: null})
  email: string;

  @Prop({type: String, default: null})
  countryCode: string;

  @Prop({type: String, default: null})
  phone: string;

  @Prop({type: String, default: null})
  password: string;

  @Prop({type: String, default: null})
  socialId: string;

  @Prop({type: String, default: null})
  socialAccessToken: string;

  @Prop({ type: Object, default: {
    type: "Point",
    coordinates: [0,0]
  } })
  location: object;

  @Prop({type: String, default: null})
  address: string;

  @Prop({type: String, default: null})
  profileImage: string;

  @Prop({type: String, default: null})
  userType: string; // Values in constant file

  @Prop({type: Date, default: null})
  createdAt: Date;

  @Prop({type: Date, default: null})
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({location: "2dsphere"});