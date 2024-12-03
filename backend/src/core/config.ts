import { z } from '@hono/zod-openapi';
import * as dotenv from 'dotenv';
import { injectable } from 'inversify';

import { logger } from './logger';

/**
 * Configuration schema
 */
export const ConfigSchema = z.object({
  // App
  BE_URL: z
    .string({ message: 'BE_URL must be a string' })
    .min(1, { message: 'BE_URL must not be empty' }),
  BE_DOMAIN: z
    .string({ message: 'BE_DOMAIN must be a string' })
    .min(1, { message: 'BE_DOMAIN must not be empty' }),
  FE_URL: z
    .string({ message: 'FE_URL must be a string' })
    .min(1, { message: 'FE_URL must not be empty' }),
  FE_DOMAIN: z
    .string({ message: 'FE_DOMAIN must be a string' })
    .min(1, { message: 'FE_DOMAIN must not be empty' }),
  PORT: z.coerce
    .number({ message: 'PORT must be a number' })
    .min(1, { message: 'PORT must be greater than 0' })
    .max(65535, { message: 'PORT must be less than 65536' }),
  JWT_SECRET: z
    .string({ message: 'JWT_SECRET must be a string' })
    .min(1, { message: 'JWT_SECRET must not be empty' }),
  VAPID_PUBLIC_KEY: z
    .string({ message: 'VAPID_PUBLIC_KEY must be a string' })
    .min(1, { message: 'VAPID_PUBLIC_KEY must not be empty' }),
  VAPID_PRIVATE_KEY: z
    .string({ message: 'VAPID_PRIVATE_KEY must be a string' })
    .min(1, { message: 'VAPID_PRIVATE_KEY must not be empty' }),
  PUSH_NOTIFICATION_SUBJECT: z
    .string({ message: 'PUSH_NOTIFICATION_SUBJECT must be a string' })
    .min(1, { message: 'PUSH_NOTIFICATION_SUBJECT must not be empty' }),

  // Database
  POSTGRES_USER: z
    .string({ message: 'POSTGRES_USER must be a string' })
    .min(1, { message: 'POSTGRES_USER must not be empty' }),
  POSTGRES_PASSWORD: z
    .string({ message: 'POSTGRES_PASSWORD must be a string' })
    .min(1, { message: 'POSTGRES_PASSWORD must not be empty' }),
  POSTGRES_DB: z
    .string({ message: 'POSTGRES_DB must be a string' })
    .min(1, { message: 'POSTGRES_DB must not be empty' }),
  POSTGRES_HOST: z
    .string({ message: 'POSTGRES_HOST must be a string' })
    .min(1, { message: 'POSTGRES_HOST must not be empty' }),

  // Add more environment variables here
});

/**
 * Configurations key & value type
 */
export type IConfigSchema = z.infer<typeof ConfigSchema>;

/**
 * Configuration implementation
 */
@injectable()
export class Config {
  // IoC Key
  static readonly Key = Symbol.for('Config');

  // Store environment variables
  private env: z.infer<typeof ConfigSchema>;

  // Load environment variables
  constructor() {
    dotenv.config();

    const rawEnv: { [key: string]: unknown } = {};
    Array.from(Object.keys(ConfigSchema.shape)).forEach((key) => {
      rawEnv[key] = process.env[key];
    });

    // Try to parse, if fail throw ZodError
    try {
      this.env = ConfigSchema.parse(rawEnv);
    } catch (error) {
      logger.error(`Config validation error ${error}`);
      process.exit(1);
    }
  }

  // Getters
  get<K extends keyof IConfigSchema>(key: K): IConfigSchema[K] {
    return this.env[key];
  }
}
