import { Injectable, Inject } from "@nestjs/common";
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from "src/schemas/users.schema";
import { getUserName } from "src/utils/functions";
import { sendEmail } from "src/utils/emails";
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class UsersService {

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    async addUserInDb(userObj: any) : Promise<any> {
        let user = new this.userModel(userObj);
        let isSaved = await user.save();
        return isSaved;
    }

    async findUserByEmail(email: string) : Promise<any> {
        return await this.userModel.findOne({email: email}).lean();
    }

    async sendWelcomeEmail(userData: any) : Promise<any> {
        return new Promise(async function (resolve, reject)
        {
            try {
                // Send the email for the otp
                let emails = [{
                    email: userData.email 
                }];
                let params = {
                    USERNAME: getUserName(userData),
                };

                let emailSuccess = await sendEmail(
                    emails,
                    process.env.WELCOME_EMAIL_ID,
                    params
                );
                
                console.log("Response of welocme email send to user ===>>>" + emailSuccess);

                return resolve(true);
            }
            catch(error) {
                console.log("error ==>>", error);
                return reject(error);
            }
        });
    }

}