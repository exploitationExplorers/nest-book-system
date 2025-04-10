import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Etcd3 } from 'etcd3';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject('ETCD_CLIENT')
  private etcdClient: Etcd3;

  @Get('put')
  async put(@Query('value') value: string) {
    await this.etcdClient.put('test').value(value);
    return 'done';
  }

  @Get('get')
  async get() {
    return await this.etcdClient.get('test').string();
  }

  @Get('del')
  async del() {
    await this.etcdClient.delete().key('test');
    return 'done';
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
