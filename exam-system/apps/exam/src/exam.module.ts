import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard, CommonModule } from '@app/common';
import { PrismaModule } from '@app/prisma';
import { RedisModule } from '@app/redis';
@Module({
  imports: [PrismaModule, RedisModule, CommonModule],
  controllers: [ExamController],
  providers: [
    ExamService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }
  ],
})
export class ExamModule {}
