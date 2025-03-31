import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TestTwoService } from './test-two.service';
import { CreateTestTwoDto } from './dto/create-test-two.dto';
import { UpdateTestTwoDto } from './dto/update-test-two.dto';
import { RequireLogin, RequirePermission } from 'src/custom-decorator';

@Controller('test-two')
@RequireLogin() // 添加权限校验
export class TestTwoController {
  constructor(private readonly testTwoService: TestTwoService) {}

  @Post()
  create(@Body() createTestTwoDto: CreateTestTwoDto) {
    return this.testTwoService.create(createTestTwoDto);
  }

  @Get()
  @RequirePermission('查询 bbb')
  findAll() {
    return this.testTwoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testTwoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestTwoDto: UpdateTestTwoDto) {
    return this.testTwoService.update(+id, updateTestTwoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testTwoService.remove(+id);
  }
}
