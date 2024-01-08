import { Controller, Post, Get, Inject, UseGuards, Req, Res, Body } from "@nestjs/common";
import { UsersService } from "./users.service";
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from "src/schemas/users.schema";
import { Otp } from "src/schemas/otp.schema";
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ApiKeyAuthGuard } from "src/auth/guard/apikey-auth.guard";
import { JwtService } from "@nestjs/jwt";
import { JwtGuard } from "src/auth/guard/jwt-auth.guard";
import { ChangePasswordDto, ChangePasswordWithOtpDto, ForgotPasswordDto, UserLoginDto, UserRegisterDto, VerifyOtpDto } from "./dto/users.dto";
import { Response } from "express";
import { MESSAGES } from "src/utils/message";
import * as bcrypt from "bcrypt";
import { userTypes } from "src/utils/constant";
import { UserResponse } from "./response/user.response";
import * as moment from 'moment'
import { sendEmail } from "src/utils/emails";
import { generateOtp, getUserName } from "src/utils/functions";

@ApiTags("Users")
@Controller('users')
export class UsersController {
    constructor( 
        private usersService: UsersService,
        private jwtService: JwtService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Otp.name) private otpModel: Model<Otp> 
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
                createdAt: new Date(),
                updatedAt: new Date()
            });

            let isSaved = await userObj.save();

            if(isSaved) {

                this.logger.info("User regsitered successfully ===>>> " + JSON.stringify(isSaved));

                let payload = { id: isSaved['_id'], email: isSaved['email'], userType: isSaved['userType'], firstName: isSaved['firstName'], lastName: isSaved['lastName'] };

                const token = await this.jwtService.signAsync(payload);

                let userData = new UserResponse(isSaved);

                // Send welcome email to every new user
                await this.usersService.sendWelcomeEmail(userData);

                return res.status(200).send({
                    status: 1,
                    message: MESSAGES.userRegisteredSuccess,
                    data: userData,
                    token: token
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

    /**
     * @Method : used to login user
     * @Author : Yogesh Hasija
     * @Date : 3rd January 2024
     */
    @ApiTags("Users")
    @ApiOperation({ description: "used to login user" })
    @ApiSecurity('key')
    @UseGuards(ApiKeyAuthGuard)
    @Post("/userLogin")
    async userLogin(@Body() reqData: UserLoginDto, @Req() req: Request, @Res() res: Response) : Promise<any> {
        const {
            email, password, userType
        } = reqData;
        try {

            const userData = await this.userModel.findOne({email: email, userType: userType}).lean();

            if(!userData) {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.noUserFound
                });
            }

            if(userData && bcrypt.compareSync(password, userData['password'])) {
                this.logger.info("User Login successfully ===>>> " + JSON.stringify(userData));

                let payload = { id: userData['_id'], email: userData['email'], userType: userData['userType'], firstName: userData['firstName'], lastName: userData['lastName'] };

                const token = await this.jwtService.signAsync(payload);

                let user = new UserResponse(userData);

                return res.status(200).send({
                    status: 1,
                    message: MESSAGES.userLoginSuccess,
                    data: user,
                    token: token
                });
            }
            else {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.invalidCredentials
                });
            }
        }
        catch(error) {
            this.logger.info("Error in user login api ===>>> " + error);
            return res.status(200).send({
                status: 0,
                message: error.message
            });
        }
    }

    /**
     * @Method : used to get the login user profile
     * @Author : Yogesh Hasija
     * @Date : 3rd January 2024
     */
    @ApiTags("Users")
    @ApiBearerAuth()
    @Get('/userProfile')
    @ApiOperation({ description: "Used to get the login user profile" })
    @UseGuards(JwtGuard)
    async userProfile(@Req() req: Request, @Res() res: Response) : Promise<any> {
        try {
            const userId = req['user'].id;

            const userData = await this.userModel.findOne({_id: userId}).lean();

            if(!userData) {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.noUserFound
                });
            }

            let user = new UserResponse(userData);

            return res.status(200).send({
                status: 1,
                message: MESSAGES.userDetails,
                data: user
            });
        }
        catch(error) {
            this.logger.info("Error in user profile api ===>>> " + error);
            return res.status(200).send({
                status: 0,
                message: error.message
            });
        }
    }


    /**
     * @Method : used to change password for user
     * @Author : Yogesh Hasija
     * @Date : 3rd January 2024
     */
    @ApiTags("Users")
    @ApiBearerAuth()
    @Post('/changePassword')
    @ApiOperation({ description: "Used to change password for user" })
    @UseGuards(JwtGuard)
    async changePassword(@Body() reqData: ChangePasswordDto,@Req() req: Request, @Res() res: Response) : Promise<any> {
        const { oldPassword, newPassword } = reqData;
        try {
            const userId = req['user'].id;


            const userData = await this.userModel.findOne({_id: userId}).lean();

            if(!userData) {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.noUserFound
                });
            }

            if(userData && bcrypt.compareSync(oldPassword, userData['password'])) {

                let password = bcrypt.hashSync(newPassword, 10);

                let updatedUser = await this.userModel.findByIdAndUpdate(
                    {
                        _id: userId
                    },
                    {
                        password: password
                    },
                    {
                        new: true
                    }
                );

                this.logger.info("Update the user with user password ====>>>>" + JSON.stringify(updatedUser));

                return res.status(200).send({
                    status: 1,
                    message: MESSAGES.passwordUpdated
                });

            }
            else {
                return res.status(200).send({
                    status: 1,
                    message: MESSAGES.invalidOldPassword
                });
            }
        }
        catch(error) {
            this.logger.info("Error in user profile api ===>>> " + error);
            return res.status(200).send({
                status: 0,
                message: error.message
            });
        }
    }


    /**
     * @Method : Used to send forgot password for user
     * @Author : Yogesh Hasija
     * @Date : 8th January 2024
     */
    @ApiTags("Users")
    @ApiSecurity('key')
    @UseGuards(ApiKeyAuthGuard)
    @ApiOperation({ description: "Used to send forgot password for user" })
    @Post('/forgotPassword')
    async forgotPassword(@Body() reqData: ForgotPasswordDto, @Req() req: Request, @Res() res: Response) : Promise<any> {
        const { email } = reqData;
        try {

            const userData = await this.userModel.findOne({ email: email }).lean();

            if(!userData) {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.noUserFound
                });
            }

            // Delete all previous otp is new otp is requested
            await this.otpModel.deleteMany({email: email});

            let newOtp = generateOtp(4);

            // Make new entry for otp schema
            let saveOtp = new this.otpModel({
                email: email,
                otp: newOtp,
                exipryTime: moment().add('10', "minutes").format("YYYY-MM-DD HH:mm:ss"),
                createdAt: new Date(),
                updatedAt: new Date()
            });

            let isSaveOtp = await saveOtp.save();

            if(isSaveOtp) {

                // Send the email for the otp
                let emails = [{
                    email: userData.email 
                }];
                let params = {
                    USERNAME: getUserName(userData),
                    OTP: newOtp
                };

                let emailSuccess = await sendEmail(
                    emails,
                    process.env.FORGOT_PASSWORD_EMAIL_ID,
                    params
                );

                if(emailSuccess) {
                    return res.status(200).send({
                        status: 1,
                        message: MESSAGES.forgotPasswordEmailSent
                    })
                }
                else {
                    return res.status(200).send({
                        status: 0,
                        message: MESSAGES.unableTosendForgotEmail
                    });
                }

            }
            else {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.unableToSaveOtp
                });
            }
            
        }
        catch(error) {
            this.logger.info("Error in user forgot password api ===>>> " + error);
            return res.status(200).send({
                status: 0,
                message: error.message
            });
        }
    }


    /**
     * @Method : Used to verify the otp
     * @Author : Yogesh Hasija
     * @Date : 8th January 2024
     */
    @ApiTags("Users")
    @ApiSecurity('key')
    @UseGuards(ApiKeyAuthGuard)
    @ApiOperation({ description: "Used to verify the otp" })
    @Post('/verifyOtp')
    async verifyOtp(@Body() reqData: VerifyOtpDto, @Req() req: Request, @Res() res: Response) : Promise<any> {
        const { email, otp } = reqData;
        try {

            const userData = await this.userModel.findOne({ email: email }).lean();

            if(!userData) {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.noUserFound
                });
            }

            // Find the otp for email
            const otpData = await this.otpModel.findOne({email: email, otp: otp}).lean();

            this.logger.info("Otp data in verify otp ===>>>" + JSON.stringify(otpData));

            if(!otpData) {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.invalidOtp
                });
            }
            
            const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
            console.log("Current time ===>>", currentTime);

            if(currentTime <= otpData.exipryTime) {
                // Delete all previous otp is new otp is validated
                await this.otpModel.deleteMany({email: email});

                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.validOtpSuccess
                });
            }
            else {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.otpExpired
                });
            }
        }
        catch(error) {
            this.logger.info("Error in user verify otp api ===>>> " + error);
            return res.status(200).send({
                status: 0,
                message: error.message
            });
        }
    }


    /**
     * @Method : Used to change password with otp
     * @Author : Yogesh Hasija
     * @Date : 8th January 2024
     */
    @ApiTags("Users")
    @ApiSecurity('key')
    @UseGuards(ApiKeyAuthGuard)
    @ApiOperation({ description: "Used to change password with otp" })
    @Post('/changePasswordWithOtp')
    async changePasswordWithOtp(@Body() reqData: ChangePasswordWithOtpDto, @Req() req: Request, @Res() res: Response) : Promise<any> {
        const { email, password } = reqData;
        try {

            const userData = await this.userModel.findOne({ email: email }).lean();

            if(!userData) {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.noUserFound
                });
            }

            let newPassword = bcrypt.hashSync(password, 10);

            // Update the user data
            const updatedUser = await this.userModel.findOneAndUpdate(
                { email: email },
                { password: newPassword },
                { new : true }
            );

            if(updatedUser) {
                return res.status(200).send({
                    status: 1,
                    message: MESSAGES.resetPasswordSuccess
                });
            }
            else {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.unableToResetPassword
                });
            }
            
        }
        catch(error) {
            this.logger.info("Error in user verify otp api ===>>> " + error);
            return res.status(200).send({
                status: 0,
                message: error.message
            });
        }
    }
};