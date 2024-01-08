import { Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { User, UserSchema } from "src/schemas/users.schema";
import { OtpSchema, Otp } from "src/schemas/otp.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Otp.name, schema: OtpSchema }])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {};