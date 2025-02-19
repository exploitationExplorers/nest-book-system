import { Module } from '@nestjs/common';
import { LogTestService } from './log-test.service';
import { LogTestController } from './log-test.controller';

@Module({
  controllers: [LogTestController],
  providers: [LogTestService],
})
export class LogTestModule {}
