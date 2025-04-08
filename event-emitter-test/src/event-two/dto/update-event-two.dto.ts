import { PartialType } from '@nestjs/mapped-types';
import { CreateEventTwoDto } from './create-event-two.dto';

export class UpdateEventTwoDto extends PartialType(CreateEventTwoDto) {}
