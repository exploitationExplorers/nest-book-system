import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { BookModule } from './book/book.module';
import { MyLogger } from './myLogger';
import { LoggerModule } from './logger/logger.module';
import { LogTestModule } from './log-test/log-test.module';
import { DynamicLogger } from './dynamicLogger/dynamicLogger.moudle';
@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    DbModule,
    BookModule,
    LoggerModule,
    LogTestModule,
    DynamicLogger.register({
      level: 1,
      logPath: 'log',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, MyLogger],
})
export class AppModule {}
