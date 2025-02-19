import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { MyLogger } from './myLogger';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(MyLogger));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors();

  app.useStaticAssets(join(__dirname, '../uploads'), { prefix: '/uploads' });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
