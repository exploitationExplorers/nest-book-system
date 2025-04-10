import { Module } from '@nestjs/common';
import { EtcdTestService } from './etcd-test.service';
import { EtcdTestController } from './etcd-test.controller';
import { EtcdModule } from 'src/etcd/etcd.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // EtcdModule.forRoot({
    //   hosts: 'http://localhost:2379',
    //   auth: {
    //     username: 'root',
    //     password: 'asd.12345',
    //   },
    // }),
    EtcdModule.forRootAsync({
      async useFactory(configService: ConfigService) {
        return {
          hosts: configService.get('etcd_hosts'),
          auth: {
            username: configService.get('etcd_auth_username'),
            password: configService.get('etcd_auth_password'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [EtcdTestController],
  providers: [EtcdTestService],
})
export class EtcdTestModule {}
