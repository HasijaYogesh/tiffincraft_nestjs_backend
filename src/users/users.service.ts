import { Injectable } from "@nestjs/common";
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from "src/schemas/users.schema";

@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User.name) private userModel: Model<User> 
    ) {}

    async addUserInDb(userObj) : Promise<any> {
        let user = new this.userModel(userObj);
        let isSaved = await user.save();
        return isSaved;
    }

}