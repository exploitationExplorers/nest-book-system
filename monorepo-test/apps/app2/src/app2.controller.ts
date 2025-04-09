import { Controller, Get, Inject } from '@nestjs/common';
import { App2Service } from './app2.service';
import { Lib1Service } from '@app/lib1';

@Controller()
export class App2Controller {
  constructor(private readonly app2Service: App2Service) {}
  @Inject(Lib1Service)
  private lib: Lib1Service;
  @Get('test2')
  test2() {
    return 'test2' + this.lib.test();
  }
  @Get()
  getHello(): string {
    return this.app2Service.getHello();
  }
}
