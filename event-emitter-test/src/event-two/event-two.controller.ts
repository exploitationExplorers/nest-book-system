import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventTwoService } from './event-two.service';
import { CreateEventTwoDto } from './dto/create-event-two.dto';
import { UpdateEventTwoDto } from './dto/update-event-two.dto';

@Controller('event-two')
export class EventTwoController {
  constructor(private readonly eventTwoService: EventTwoService) {}

  @Post()
  create(@Body() createEventTwoDto: CreateEventTwoDto) {
    return this.eventTwoService.create(createEventTwoDto);
  }

  @Get()
  findAll() {
    return this.eventTwoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventTwoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventTwoDto: UpdateEventTwoDto) {
    return this.eventTwoService.update(+id, updateEventTwoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventTwoService.remove(+id);
  }
}
