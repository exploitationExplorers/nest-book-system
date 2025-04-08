import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        const clinet = createClient({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        });
        await clinet.connect();
        return clinet;
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
