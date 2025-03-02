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
import { createClient } from 'redis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Permission } from './user/entities/permission.entity';
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
    TypeOrmModule.forRoot({
      type: 'mysql', //数据库类型
      username: 'root', //账号
      password: 'asd.12345', //密码
      host: 'localhost', //host
      port: 3306, //
      database: 'acl_test', //库名
      entities: [User, Permission],
      synchronize: true, //synchronize字段代表是否自动将实体类同步到数据库
      retryDelay: 500, //重试连接数据库间隔
      retryAttempts: 10, //重试连接数据库的次数
      logging: true, //是否开启日志
      poolSize: 10, //连接池大小
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        const client = createClient({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        });
        await client.connect();
        return client;
      },
    },
  ],
})
export class AppModule {}
