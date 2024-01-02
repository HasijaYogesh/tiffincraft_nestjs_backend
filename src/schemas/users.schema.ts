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

  @Prop({ type: Object, default: {
    type: "Point",
    coordinates: [0,0]
  } })
  location: object;

  @Prop({default: null})
  address: string;

  @Prop({default: null})
  profileImage: string;

  @Prop({default: null})
  userType: string; // Values in constant file

  @Prop({default: null})
  createdAt: string;

  @Prop({default: null})
  updatedAt: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({location: "2dsphere"});