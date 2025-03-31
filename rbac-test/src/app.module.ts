import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { Role } from './user/entities/role.entity';
import { Permission } from './user/entities/permission.entity';
import { JwtModule } from '@nestjs/jwt';
import { TestOneModule } from './test-one/test-one.module';
import { TestTwoModule } from './test-two/test-two.module';
import { APP_GUARD } from '@nestjs/core';
import { LoginGuard } from './login.guard';
import { PermissionGuard } from './permission.guard';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', //数据库类型
      username: 'root', //账号
      password: 'asd.12345', //密码
      host: 'localhost', //host
      port: 3306, //
      database: 'rbac_test', //库名
      entities: [User, Role, Permission],
      synchronize: true, //synchronize字段代表是否自动将实体类同步到数据库
      retryDelay: 500, //重试连接数据库间隔
      retryAttempts: 10, //重试连接数据库的次数
      logging: true, //是否开启日志
      poolSize: 10, //连接池大小
    }),
    JwtModule.register({
      global: true,
      secret: 'secret',
      signOptions: { expiresIn: '7d' },
    }),
    UserModule,
    TestOneModule,
    TestTwoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
