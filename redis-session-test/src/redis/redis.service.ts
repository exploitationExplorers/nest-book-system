import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private readonly redisClient: RedisClientType;

  /**异步获取哈希集合 */
  async hashGet(key: string) {
    // 返回redis客户端获取指定key的所有哈希集合
    return await this.redisClient.hGetAll(key);
  }

  /**异步设置哈希表 */
  async hashSet(key: string, obj: Record<string, any>, ttl?: number) {
    // 遍历对象
    for (const name in obj) {
      // 设置哈希表
      await this.redisClient.hSet(key, name, obj[name]);
    }
    // 如果有设置过期时间
    if (ttl) {
      // 设置过期时间
      await this.redisClient.expire(key, ttl);
    }
  }
}
