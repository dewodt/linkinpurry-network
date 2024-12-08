import { inject, injectable } from 'inversify';
import { Redis } from 'ioredis';

import { Config } from '@/core/config';
import { logger } from '@/core/logger';

@injectable()
export class RedisClient {
  // IoC Key
  static readonly Key = Symbol.for('RedisClient');

  private client: Redis;

  constructor(@inject(Config.Key) private readonly config: Config) {
    this.client = new Redis(this.config.get('REDIS_URL'), {
      keepAlive: 5000,
    });
    logger.info('Connected to Redis');
  }

  /**
   * Connect to redis
   */
  public async connect(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Disconnect from redis
   */
  public async disconnect(): Promise<void> {
    this.client.disconnect();
  }

  /**
   * Set key value
   */
  public async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  /**
   * Set key with TTL
   */
  public async setWithTTL(key: string, value: string, ttl: number): Promise<void> {
    await this.client.setex(key, ttl, value);
  }

  /**
   * Get key value
   */
  public async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Delete key with a certain prefix
   */
  public async deleteWithPrefix(prefix: string): Promise<void> {
    let cursor = '0';

    do {
      const [newCursor, keys] = await this.client.scan(cursor, 'MATCH', `${prefix}*`);
      cursor = newCursor;
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } while (cursor !== '0');
  }

  /**
   * Delete a key
   */
  public async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    const exists = await this.client.exists(key);
    return exists === 1;
  }
}
