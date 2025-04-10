import { DynamicModule, Module } from '@nestjs/common';
import { EtcdService } from './etcd.service';
import { Etcd3, IOptions } from 'etcd3';
export const ETCD_CLIENT_TOKEN = 'ETCD_CLIENT';

export const ETCD_CLIENT_OPTIONS_TOKEN = 'ETCD_CLIENT_OPTIONS';

export interface EtcdModuleAsyncOptions {
  useFactory?: (...args: any[]) => Promise<IOptions> | IOptions;
  inject?: any[];
}

// @Module({
//   providers: [
//     EtcdService,
//     {
//       provide: 'ETCD_CLIENT',
//       useFactory: () => {
//         const etcd = new Etcd3({
//           hosts: 'http://localhost:2379',
//           auth: {
//             username: 'root',
//             password: 'asd.12345',
//           },
//         });
//         return etcd;
//       },
//     },
//   ],
//   exports: [EtcdService],
// })
@Module({})
export class EtcdModule {
  static forRoot(options?: IOptions): DynamicModule {
    return {
      module: EtcdModule,
      providers: [
        EtcdService,
        {
          provide: ETCD_CLIENT_TOKEN,
          useFactory(options: IOptions) {
            const client = new Etcd3(options);
            return client;
          },
          inject: [ETCD_CLIENT_OPTIONS_TOKEN],
        },
        {
          provide: ETCD_CLIENT_OPTIONS_TOKEN,
          useValue: options,
        },
      ],
      exports: [EtcdService],
    };
  }

  static forRootAsync(options: EtcdModuleAsyncOptions): DynamicModule {
    return {
      module: EtcdModule,
      providers: [
        EtcdService,
        {
          provide: ETCD_CLIENT_TOKEN,
          useFactory(options: IOptions) {
            const client = new Etcd3(options);
            return client;
          },
          inject: [ETCD_CLIENT_OPTIONS_TOKEN],
        },
        {
          provide: ETCD_CLIENT_OPTIONS_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      exports: [EtcdService],
    };
  }
}
