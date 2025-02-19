import { Global, Module } from '@nestjs/common';
import { LoggerTest } from './MyLogger';
@Global()
@Module({
  providers: [LoggerTest],
  exports: [LoggerTest],
})
export class LoggerModule {}
