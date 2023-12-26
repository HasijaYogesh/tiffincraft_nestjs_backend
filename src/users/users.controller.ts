import { Controller, Post, Get } from "@nestjs/common";
import { UsersService } from "./users.service";
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from "src/schemas/users.schema";

@Controller('users')
export class UsersController {
    constructor( 
        private usersService: UsersService,
        @InjectModel(User.name) private userModel: Model<User> 
    ) {};

    @Get()
    async addUser() : Promise<any> {
        let userObj = {
            firstName: "test",
            lastName: "mailinator",
            email: "test@mailiantor.com",
            password: "12345678"
        };

        return await this.usersService.addUserInDb(userObj);
    }

};