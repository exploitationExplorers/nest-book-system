import { Inject } from '@nestjs/common';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { AppService } from './app.service';

@Injectable()
export class MyLogger extends ConsoleLogger {
  @Inject(AppService)
  private appService: AppService;

  log(message, context) {
    console.log(this.appService.getHello());
    console.log(`[${context}]`, message);
    console.log('--------------');
  }
}
