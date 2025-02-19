import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { LogTestService } from './log-test.service';
import { CreateLogTestDto } from './dto/create-log-test.dto';
import { UpdateLogTestDto } from './dto/update-log-test.dto';
import { LoggerTest } from 'src/logger/MyLogger';
@Controller('log-test')
export class LogTestController {
  @Inject(LoggerTest)
  private logger: LoggerTest;
  constructor(private readonly logTestService: LogTestService) {}

  @Post()
  create(@Body() createLogTestDto: CreateLogTestDto) {
    return this.logTestService.create(createLogTestDto);
  }

  @Get()
  findAll() {
    this.logger.log('findAll', LogTestController.name);
    return this.logTestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logTestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogTestDto: UpdateLogTestDto) {
    return this.logTestService.update(+id, updateLogTestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logTestService.remove(+id);
  }
}
