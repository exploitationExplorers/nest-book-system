import { Module } from '@nestjs/common';
import { EventTwoService } from './event-two.service';
import { EventTwoController } from './event-two.controller';

@Module({
  controllers: [EventTwoController],
  providers: [EventTwoService],
})
export class EventTwoModule {}
