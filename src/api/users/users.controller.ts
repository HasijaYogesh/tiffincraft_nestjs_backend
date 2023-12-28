import { Controller, Post, Get } from "@nestjs/common";
import { UsersService } from "./users.service";
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from "src/schemas/users.schema";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Users")
@Controller('users')
export class UsersController {
    constructor( 
        private usersService: UsersService,
        @InjectModel(User.name) private userModel: Model<User> 
    ) {};
    
    @Get()
    @ApiOperation({ description: "Dummy api to create users" })
    async addUser() : Promise<any> {
        let userObj = {
            firstName: "test",
            lastName: "mailinator",
            email: "test@mailiantor.com",
            password: "12345678"
        };

        return await this.usersService.addUserInDb(userObj);
    }

    @Post()
    @ApiOperation({ description: "Dummy api to create users" })
    async createUser() : Promise<any> {
        let userObj = {
            firstName: "test",
            lastName: "mailinator",
            email: "test@mailiantor.com",
            password: "12345678"
        };

        return await this.usersService.addUserInDb(userObj);
    }

};