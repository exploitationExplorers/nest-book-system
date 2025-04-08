import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(EventEmitter2)
  private eventEmitter: EventEmitter2;

  create(createUserDto: CreateUserDto) {
    this.eventEmitter.emit('user.register', {
      username: createUserDto.username,
      email: createUserDto.email,
    });

    return 'This action adds a new user';
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
