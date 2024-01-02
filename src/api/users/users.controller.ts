import { Controller, Post, Get, Inject, UseGuards, Req, Res, Body } from "@nestjs/common";
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
import { UserRegisterDto } from "./dto/users.dto";
import { Response } from "express";
import { MESSAGES } from "src/utils/message";
import * as bcrypt from "bcrypt";
import { userTypes } from "src/utils/constant";
import { UserResponse } from "./response/user.response";
import * as moment from 'moment'

@ApiTags("Users")
@Controller('users')
export class UsersController {
    constructor( 
        private usersService: UsersService,
        private jwtService: JwtService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @InjectModel(User.name) private userModel: Model<User> 
    ) {};
    
    /**
     * @Method : used to register the new user
     * @Author : Yogesh Hasija
     * @Date : 2nd January 2024
     */
    @ApiTags("Users")
    @ApiOperation({ description: "Used to register new user" })
    @ApiSecurity('key')
    @UseGuards(ApiKeyAuthGuard)
    @Post("/userRegister")
    async userRegister(@Body() reqData: UserRegisterDto, @Req() req: Request, @Res() res: Response) : Promise<any> {
        const {
            firstName, lastName, email, countryCode, phone, password, location, address, profileImage, userType
        } = reqData;
        try { 

            const userData = await this.userModel.findOne({email: email, userType: userType}).lean();

            if(userData) {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.userAlreadyExists
                });
            }

            let newPassword = bcrypt.hashSync(password, 10);

            let userObj = new this.userModel({
                firstName: firstName ? firstName : null,
                lastName: lastName ? lastName : null,
                email: email ? email : null,
                countryCode: countryCode ? countryCode : null,
                phone: phone ? phone : null,
                password: newPassword,
                location: location ? location : {type: "Point", coordinates:[0,0]},
                address: address ? address : null,
                profileImage: profileImage ? profileImage : null,
                userType: userType ? userType : userTypes.receiver,
                createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
                updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
            });

            let isSaved = await userObj.save();

            if(isSaved) {

                this.logger.info("User regsitered successfully ===>>> " + JSON.stringify(isSaved));

                let payload = { id: isSaved['_id'], email: isSaved['email'], userType: isSaved['userType'], firstName: isSaved['firstName'], lastName: isSaved['lastName'] };

                const token = await this.jwtService.signAsync(payload);

                let userData = new UserResponse(isSaved);

                return res.status(200).send({
                    status: 1,
                    message: MESSAGES.userRegisteredSuccess,
                    token: token,
                    data: userData
                });

            }
            else {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.unableToRegisterUser
                });
            }
        }
        catch(error) {
            this.logger.info("Error in user register api ===>>> " + error);
            return res.status(200).send({
                status: 0,
                message: error.message
            });
        }
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