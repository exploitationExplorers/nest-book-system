import { Inject, Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventService {
  @Inject(EventEmitter2)
  private eventEmitter: EventEmitter2;
  findAll() {
    this.eventEmitter.emit('eventOne.findall', { data: 'Hello World!' });
    this.eventEmitter.emit('eventOne.findall2', { data: 'Hello World2!' });

    return `This action returns all eventOne`;
  }
  create(createEventDto: CreateEventDto) {
    return 'This action adds a new event';
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
