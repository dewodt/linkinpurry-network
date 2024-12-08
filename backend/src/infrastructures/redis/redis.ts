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
  public async set(key: string, value: string, expiresIn?: number): Promise<void> {
    try {
      if (expiresIn) {
        await this.client.setex(key, expiresIn, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);
    }
  }

  /**
   * Set key json/object value
   */
  public async setJson<T extends Object>(key: string, value: T, expiresIn?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (expiresIn) {
        await this.client.setex(key, expiresIn, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);
    }
  }

  /**
   * Get key value
   */
  public async get(key: string): Promise<string | null> {
    try {
      return this.client.get(key);
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);
      return null;
    }
  }

  /**
   * Get key json/object value
   */
  public async getJson<T extends Object>(key: string): Promise<T | null> {
    try {
      const serialized = await this.client.get(key);
      if (!serialized) return null;
      return JSON.parse(serialized) as T;
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);
      return null;
    }
  }

  /**
   * Delete key with a certain prefix
   */
  public async deleteWithPrefix(prefix: string): Promise<number> {
    try {
      let cursor = '0';
      let deletedCount = 0;

      do {
        const [newCursor, keys] = await this.client.scan(cursor, 'MATCH', `${prefix}*`);
        cursor = newCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== '0');

      return deletedCount;
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);
      return 0;
    }
  }

  /**
   * Delete a key
   */
  public async delete(key: string): Promise<number> {
    try {
      const deletedCount = await this.client.del(key);
      return deletedCount;
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);
      return false;
    }
  }
}
