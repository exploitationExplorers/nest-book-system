import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true, // 严格限制请求中的字段
    }),
  );
  // 允许跨域
  app.enableCors();

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
