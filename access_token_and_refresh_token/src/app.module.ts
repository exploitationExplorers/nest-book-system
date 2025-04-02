import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot({
      type: 'mysql', //数据库类型
      username: 'root', //账号
      password: 'asd.12345', //密码
      host: 'localhost', //host
      port: 3306, //
      database: 'refresh_token_test', //库名
      entities: [User],
      synchronize: true, //synchronize字段代表是否自动将实体类同步到数据库
      retryDelay: 500, //重试连接数据库间隔
      retryAttempts: 10, //重试连接数据库的次数
      logging: true, //是否开启日志
      poolSize: 10, //连接池大小
    }),
    JwtModule.register({
      global: true,
      signOptions: {
        expiresIn: '30m',
      },
      secret: 'secret',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
