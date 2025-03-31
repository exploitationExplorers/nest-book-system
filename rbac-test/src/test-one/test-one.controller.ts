import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TestOneService } from './test-one.service';
import { CreateTestOneDto } from './dto/create-test-one.dto';
import { UpdateTestOneDto } from './dto/update-test-one.dto';
import { RequireLogin, RequirePermission } from 'src/custom-decorator';

@Controller('test-one')
@RequireLogin() // 添加权限校验
export class TestOneController {
  constructor(private readonly testOneService: TestOneService) {}

  @Post()
  create(@Body() createTestOneDto: CreateTestOneDto) {
    return this.testOneService.create(createTestOneDto);
  }

  @Get()
  findAll() {
    return this.testOneService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testOneService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestOneDto: UpdateTestOneDto) {
    return this.testOneService.update(+id, updateTestOneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testOneService.remove(+id);
  }
}
