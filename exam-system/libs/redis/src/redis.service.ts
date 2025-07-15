import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private readonly redisClient: RedisClientType;

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redisClient.keys(pattern);
    } catch (error) {
      console.error('Error fetching keys from Redis:', error);
      throw error;
    }
  }

  async get(key: string): Promise<string> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      console.error('Error fetching key from Redis:', error);
      throw error;
    }
  }

  async set(key: string, value: string | number, ttl?: number): Promise<void> {
    await this.redisClient.set(key, value);

    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  async zRankingList(key: string, start: number = 0, end: number = -1) {
    return this.redisClient.zRange(key, start, end, {
      REV: true,
    });
  }

  async zAdd(key: string, members: Record<string, number>) {
    const mems = [];
    for (const key in members) {
      mems.push({
        value: key,
        score: members[key],
      });
    }
    return await this.redisClient.zAdd(key, mems);
  }
}
