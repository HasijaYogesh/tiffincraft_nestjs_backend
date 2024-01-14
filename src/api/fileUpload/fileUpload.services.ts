import { Injectable, Inject } from "@nestjs/common";
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as Multiparty from 'multiparty';
// import Downloader from "nodejs-file-downloader";
const Downloader = require("nodejs-file-downloader");

@Injectable()
export class FileUploadService {

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    /**
   * Method used to get the file from multiparty data
   * @author Yogesh
   * @date 13th January-2024
   */
  async multipartyData(req: any): Promise<any>
  {
    return new Promise(async (resolve, reject) => {
      try {
        const form = new Multiparty.Form();
        form.parse(req, async (err: any, fields: any, files: any) => {
          if (err) {
            resolve({
              fields: null,
              files: null,
            });
          }
        resolve(files);
    });
      } catch (error) {
        this.logger.error("------------ multipartyData ------------\n " + error);
        reject(error.message);
      }
    });
  }


  async downloadFileOnLocal(fileName: any): Promise<any>
  {
    return new Promise(async (resolve, reject) =>
    {
      console.log("In download file on local function");
      const date = Date.now();
      const downloader = new Downloader({
        url: fileName,
        directory: `./downloads/`,
        fileName: `${date}.jpg`,
      });
      try
      {
        await downloader.download();
        resolve('./downloads/' + date + '.jpg');
      } catch (error)
      {
        this.logger.info("Error in download file on local ===>>> ", error.message);
        resolve(false);
      }
    });
  }

}