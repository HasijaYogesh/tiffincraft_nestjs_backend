import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import * as fs from 'fs';
const logDir = 'debuglogs';
import { WinstonModule } from 'nest-winston';
let winston = require('winston');
winston.transports.DailyRotateFile = require('winston-daily-rotate-file');
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './api/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { FileUploadModule } from './api/fileUpload/fileUpload.module';

if (!fs.existsSync(logDir))
{
  fs.mkdirSync(logDir);
  fs.chmodSync(logDir, 0o777);
}

const logLevel = 'debug';
const loglevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};
const logger = winston.createLogger({
  level: logLevel,
  levels: loglevels,
  format: winston.format.combine(
    winston.format.errors({
      stack: true,
    }),
    //winston.format.prettyPrint(),
    winston.format.timestamp({
      format: 'DD-MM-YYYY hh:mm:ss A',
    }),
    winston.format.json(),
    winston.format.printf((info) =>
    {
      const { timestamp, level, message, ...args } = info;
      return `${timestamp} ${level}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
        }`;
    }),
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: `${logDir}/api/%DATE%.log`,
      datePattern: 'DDMMMYYYY',
      handleExceptions: true,
      //prettyPrint: true,
      json: true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: `${logDir}/exceptions/%DATE%.log`,
      datePattern: 'DDMMMYYYY',
      //prettyPrint: true,
      handleExceptions: true,
      json: true,
    }),
  ],
  exitOnError: true,
});

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      dbName: process.env.DBNAME,
    }),
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transports: [
          logger.add(
            // new winston.transports.File({
            //   filename: `${process.cwd()}/${configService.get('LOG_PATH')}`,
            // }),
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.errors({
                  stack: true,
                }),
                winston.format.prettyPrint(),
                winston.format.timestamp({
                  format: 'DD-MM-YYYY hh:mm:ss A',
                }),
                winston.format.json(),
                winston.format.printf((info) =>
                {
                  const { timestamp, level, message, ...args } = info;
                  return `${timestamp} ${level}: ${message} ${Object.keys(args).length
                    ? JSON.stringify(args, null, 2)
                    : ''
                    }`;
                }),
              ),
            }),
          ),
        ],
      }),
      inject: [ConfigService],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES },
    }),
    UsersModule,
    AuthModule,
    FileUploadModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}