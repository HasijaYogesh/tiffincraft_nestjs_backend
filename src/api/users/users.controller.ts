import { Controller, Post, Get, Inject, UseGuards, Req } from "@nestjs/common";
import { UsersService } from "./users.service";
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from "src/schemas/users.schema";
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ApiKeyAuthGuard } from "src/auth/guard/apikey-auth.guard";
import { JwtService } from "@nestjs/jwt";
import { JwtGuard } from "src/auth/guard/jwt-auth.guard";

@ApiTags("Users")
@Controller('users')
export class UsersController {
    constructor( 
        private usersService: UsersService,
        private jwtService: JwtService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
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
        this.logger.info("userObj ====>>> " + JSON.stringify(userObj));
        return true;
        // return await this.usersService.addUserInDb(userObj);
    }

    @ApiSecurity('key')
    @Get('key')
    @ApiOperation({ description: "Test api key" })
    @UseGuards(ApiKeyAuthGuard)
    async createUser() : Promise<any> {
        let userObj = {
            firstName: "test",
            lastName: "mailinator",
            email: "test@mailiantor.com",
            password: "12345678"
        };

        return {token : await this.jwtService.signAsync(userObj)};
    }

    @ApiBearerAuth()
    @Get('profile')
    @ApiOperation({ description: "Test auth token" })
    @UseGuards(JwtGuard)
    async profile(@Req() req: Request) : Promise<any> {
        return req['user'];
    }

};