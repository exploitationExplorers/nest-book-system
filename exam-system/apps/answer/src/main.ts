import { NestFactory } from '@nestjs/core';
import { AnswerModule } from './answer.module';

async function bootstrap() {
  const app = await NestFactory.create(AnswerModule);
  await app.listen(process.env.port ?? 3003);
}
bootstrap();
