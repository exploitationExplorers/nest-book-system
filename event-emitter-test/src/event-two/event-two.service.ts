import { Injectable } from '@nestjs/common';
import { CreateEventTwoDto } from './dto/create-event-two.dto';
import { UpdateEventTwoDto } from './dto/update-event-two.dto';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class EventTwoService {
  create(createEventTwoDto: CreateEventTwoDto) {
    return 'This action adds a new eventTwo';
  }
  @OnEvent('eventOne.*')
  handleEventOneFindAll(payload) {
    console.log('EventOne findall 调用', payload);
    this.create(new CreateEventTwoDto());
  }
  findAll() {
    return `This action returns all eventTwo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventTwo`;
  }

  update(id: number, updateEventTwoDto: UpdateEventTwoDto) {
    return `This action updates a #${id} eventTwo`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventTwo`;
  }
}
