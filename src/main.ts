import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  // console.log(configService.get('PORT'));

  const config = new DocumentBuilder()
    .setTitle('Tiffin Craft')
    .setDescription('This is a swagger document for the tiffincraft project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('tiffincraft-api-swagger', app, document);

  await app.listen(
    process.env.PORT
  ).then(()=>console.log("Server started successfully"));
}
bootstrap();
