import { Inject, Injectable } from '@nestjs/common';
import { MyLogger } from './dynamicLogger/MyLogger';
@Injectable()
export class AppService {
  @Inject(MyLogger)
  private logger: MyLogger;
  getHello(): string {
    this.logger.log('DynamicLogger', AppService.name);
    return 'Hello World!';
  }
}
