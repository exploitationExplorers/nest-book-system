import { Controller, Get, Logger, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
@Controller()
export class AppController {
  private logger = new Logger('AppController');
  constructor(private readonly appService: AppService) {}
  @Inject(ConfigService)
  private configService: ConfigService;
  @Get()
  getHello() {
    // this.logger.log('Hello World');
    // this.logger.error('error', AppController.name);
    // this.logger.log('log', AppController.name);
    // this.logger.verbose('verbose', AppController.name);
    // this.logger.warn('warn', AppController.name);
    //return this.appService.getHello();
    return {
      a: this.configService.get('a'),
      b: this.configService.get('b'),
    };
  }
  @Post('log')
  log(@Body() body) {
    console.log(body);
  }
}
