import { Controller, Post, Get, Inject, UseGuards, Req, Res, Body, Param, Query } from "@nestjs/common";
import { FileUploadService } from "./fileUpload.services";
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ApiKeyAuthGuard } from "src/auth/guard/apikey-auth.guard";
import { JwtService } from "@nestjs/jwt";
import { JwtGuard } from "src/auth/guard/jwt-auth.guard";
import { Response } from "express";
import { MESSAGES } from "src/utils/message";
import * as bcrypt from "bcrypt";
import { userTypes } from "src/utils/constant";
import * as moment from 'moment'
import { sendEmail } from "src/utils/emails";
import { generateOtp, getUserName } from "src/utils/functions";
import { DeleteFileDto, DeleteFileQueryDto, DownloadFileDto } from "./dto/fileUpload.dto";
import { deleteImageFromCloudinary, getImageUrlFromCloudinary, uploadImageOnCloudinary } from "src/utils/imageUploader";
import { User } from "src/schemas/users.schema";

@ApiTags("File Upload")
@Controller('fileUpload')
export class FileUploadController {
    constructor( 
        private fileUploadService: FileUploadService,
        private jwtService: JwtService,
        @InjectModel(User.name) private userModel: Model<User>,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {};
    

    /**
   * @Method used to get upload the image for category
   * @author Yogesh
   * @date 13-January-2023
   * @modified Worked on multiple image upload
   */
  @ApiBearerAuth()
  @ApiTags('File Upload')
  @ApiOperation({ summary: 'Used to get upload the image for category' })
  @UseGuards(JwtGuard)
  @Post('/imageUpload/:folderName')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: "array",
          items: {
            type: "string",
            format: "binary"
          }
        }
      },
    },
  })
  async imageUpload(
    @Param('folderName') folderName: string,
    @Query() query: DeleteFileQueryDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any>
  {
    try
    {
      if (!folderName || folderName == "" || folderName == null)
      {
        return res.status(200).send({
          status: 0,
          message: MESSAGES.folderNameRequired
        })
      }

      const { previousFile } = query;

      if (previousFile && previousFile != null && previousFile != "")
      {
        const deleteImageData = await deleteImageFromCloudinary(previousFile);
        this.logger.info("Response of delete file from cloudinary ====== " + JSON.stringify(deleteImageData));
      }

      const multipartyData = await this.fileUploadService.multipartyData(req);
      // Uploading a single image
      if (
        multipartyData &&
        multipartyData.file &&
        multipartyData.file.length == 1
      )
      {
        const file = multipartyData.file[0];
        if (file.originalFilename === "")
        {
          return res.status(200).send({
            status: 0,
            message: MESSAGES.noFileSelected,
          });
        }
        const result = await uploadImageOnCloudinary(
            file.path,
            folderName
        );
        this.logger.info("Result for the image upload ===>>> " + JSON.stringify(result));
        if (result)
        {
          let finaldata = {
            publicId: result['public_id'],
            accessUrl: await getImageUrlFromCloudinary(result['public_id'])
          };
          return res.status(200).send({
            status: 1,
            message: MESSAGES.fileUploadedSuccess,
            data: [finaldata],
          });
        }
        return res.send({
          status: 0,
          message: MESSAGES.failedToUploadFile,
        });
      }

      // Uploading multiple images
      else if (
        multipartyData &&
        multipartyData.file &&
        multipartyData.file.length > 1
      )
      {
        let imgArr = [];
        for (let i = 0; i < multipartyData.file.length; i++)
        {
          const file = multipartyData.file[i];
          //upload image S3 aws
          const result = await uploadImageOnCloudinary(
            file.path,
            folderName
        );
        this.logger.info("Result for the image upload ===>>> " + JSON.stringify(result));
          if (result)
          {
            let finaldata = {
                publicId: result['public_id'],
                accessUrl: await getImageUrlFromCloudinary(result['public_id'])
            };
            imgArr.push(finaldata);
          }
        }
        return res.status(200).send({
          status: 1,
          message: MESSAGES.fileUploadedSuccess,
          data: imgArr,
        });
      }
      else
      {
        return res.send({
          status: 0,
          message: MESSAGES.failedToUploadFile,
        });
      }
    } catch (error)
    {
      return res.send({
        status: false,
        message: error.message
      });
    }
  }

    /**
     * @Method : Used to delete image from cloudinary
     * @Author : Yogesh Hasija
     * @Date : 14th January 2024
     */
    @ApiTags("File Upload")
    @ApiBearerAuth()
    @Post('/deleteFile')
    @ApiOperation({ description: "Used to delete image from cloudinary" })
    @UseGuards(JwtGuard)
    async deleteFile(@Body() reqData: DeleteFileDto,@Req() req: Request, @Res() res: Response) : Promise<any> {
        const { fileNames } = reqData;
        try {
            const userId = req['user'].id;

            const userData = await this.userModel.findOne({_id: userId}).lean();

            if(!userData) {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.noUserFound
                });
            }

            for(let i=0; i<fileNames.length; i++) {
                const deleted = await deleteImageFromCloudinary(fileNames[i]);
                this.logger.info("Deleted the file from cloudinary response ====>>>" + JSON.stringify(deleted));
            }
            
            return res.status(200).send({
                status: 1,
                message: MESSAGES.filesDeletedSuccessfully
            })
        }
        catch(error) {
            this.logger.info("Error in file delete from cloudinary ===>>> " + error);
            return res.status(200).send({
                status: 0,
                message: error.message
            });
        }
    }


    /**
     * @Method : Used to download the file on local server
     * @Author : Yogesh Hasija
     * @Date : 14th January 2024
     */
    @ApiTags("File Upload")
    @ApiBearerAuth()
    @Post('/downloadFileOnServer')
    @ApiOperation({ description: "Used to download the file on local server" })
    @UseGuards(JwtGuard)
    async downloadFileOnServer(@Body() reqData: DownloadFileDto, @Req() req: Request, @Res() res: Response) : Promise<any> {
        const { fileName } = reqData;
        try {
            const userId = req['user'].id;

            const userData = await this.userModel.findOne({_id: userId}).lean();

            if(!userData) {
                return res.status(200).send({
                    status: 0,
                    message: MESSAGES.noUserFound
                });
            }

            const downloaded = await this.fileUploadService.downloadFileOnLocal(fileName);
            
            return res.status(200).send({
                status: 1,
                message: MESSAGES.filesDownloadedSuccessfully,
                data: downloaded
            });
        }
        catch(error) {
            this.logger.info("Error in file delete from cloudinary ===>>> " + error);
            return res.status(200).send({
                status: 0,
                message: error.message
            });
        }
    }
};