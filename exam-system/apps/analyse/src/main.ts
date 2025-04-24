import { NestFactory } from '@nestjs/core';
import { AnalyseModule } from './analyse.module';

async function bootstrap() {
  const app = await NestFactory.create(AnalyseModule);
  await app.listen(process.env.port ?? 3004);
}
bootstrap();
