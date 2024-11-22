import * as dotenv from 'dotenv';
import { injectable } from 'inversify';
import * as z from 'zod';

import { logger } from './logger';

/**
 * Interface definition
 */
export interface IConfig {
  get(key: keyof z.infer<typeof ConfigSchema>): string;
}

/**
 * Configuration schema
 */
export const ConfigSchema = z.object({
  // App
  PORT: z
    .string({ message: 'PORT must be a string' })
    .min(1, { message: 'PORT must not be empty' }),
  JWT_SECRET: z
    .string({ message: 'JWT_SECRET must be a string' })
    .min(1, { message: 'JWT_SECRET must not be empty' }),

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
 * Configuration implementation
 */
@injectable()
export class Config implements IConfig {
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
      throw error;
    }
  }

  // Getters
  get(key: keyof z.infer<typeof ConfigSchema>): string {
    return this.env[key];
  }
}
