import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private logger = new Logger('AppController');
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    this.logger.log('Hello World');
    this.logger.error('error', AppController.name);
    this.logger.log('log', AppController.name);
    this.logger.verbose('verbose', AppController.name);
    this.logger.warn('warn', AppController.name);
    return this.appService.getHello();
  }
}
