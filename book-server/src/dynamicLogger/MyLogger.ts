import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MyLogger extends ConsoleLogger {
  @Inject('LOG_OPTIONS')
  public options: Record<string, any>;

  log(message: any, context?: string) {
    console.log(this.options);

    console.log(`[${context}]`, message);
    console.log('--------------');
  }
}
