import { Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';
import { FileUploadController } from "./fileUpload.controller";
import { FileUploadService } from "./fileUpload.services";
import { User, UserSchema } from "src/schemas/users.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [FileUploadController],
    providers: [FileUploadService],
    exports: [FileUploadService]
})
export class FileUploadModule {};