import { Module } from '@nestjs/common';
import { TestTwoService } from './test-two.service';
import { TestTwoController } from './test-two.controller';

@Module({
  controllers: [TestTwoController],
  providers: [TestTwoService],
})
export class TestTwoModule {}
