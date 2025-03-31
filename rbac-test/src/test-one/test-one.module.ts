import { Module } from '@nestjs/common';
import { TestOneService } from './test-one.service';
import { TestOneController } from './test-one.controller';

@Module({
  controllers: [TestOneController],
  providers: [TestOneService],
})
export class TestOneModule {}
