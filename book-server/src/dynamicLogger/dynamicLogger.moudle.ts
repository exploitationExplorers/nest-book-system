import { DynamicModule, Global, Module } from '@nestjs/common';
import { MyLogger } from './MyLogger';

@Module({})
export class DynamicLogger {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: DynamicLogger,
      providers: [
        {
          provide: 'LOG_OPTIONS',
          useValue: options,
        },
        MyLogger,
      ],
      exports: [MyLogger, 'LOG_OPTIONS'],
    };
  }
}
