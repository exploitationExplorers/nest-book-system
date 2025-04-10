import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Query,
} from '@nestjs/common';
import { EtcdTestService } from './etcd-test.service';
import { CreateEtcdTestDto } from './dto/create-etcd-test.dto';
import { UpdateEtcdTestDto } from './dto/update-etcd-test.dto';
import { EtcdService } from 'src/etcd/etcd.service';

@Controller('etcd-test')
export class EtcdTestController {
  constructor(private readonly etcdTestService: EtcdTestService) {}
  @Inject(EtcdService)
  private etcdService: EtcdService;
  @Get('save')
  async saveConfig(@Query('value') value: string) {
    await this.etcdService.saveConfig('test', value);
    return 'done';
  }
  @Get('get')
  async getConfig() {
    return await this.etcdService.getConfig('test');
  }
  @Post()
  create(@Body() createEtcdTestDto: CreateEtcdTestDto) {
    return this.etcdTestService.create(createEtcdTestDto);
  }

  @Get()
  findAll() {
    return this.etcdTestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.etcdTestService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEtcdTestDto: UpdateEtcdTestDto,
  ) {
    return this.etcdTestService.update(+id, updateEtcdTestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.etcdTestService.remove(+id);
  }
}
