import { z } from 'zod';

/**
 * Create a singleton object to store enviroment variables
 */
export const configSchema = z.object({
  VITE_BE_URL: z.string({ message: 'BE_URL is required' }).min(1, { message: 'BE_URL is required' }).default('http://localhost:3000'),
  NODE_ENV: z.string({ message: 'NODE_ENV is required' }).min(1, { message: 'NODE_ENV is required' }).default('development'),
  VAPID_PUBLIC_KEY: z
    .string({ message: 'VAPID_PUBLIC_KEY is required' })
    .min(1, { message: 'VAPID_PUBLIC_KEY is required' })
    .default('BHdRIKBKTLsgW81Y5daavGcsMADBBc-UObNpUpEtgUKB1Bue7Jh-bKgJtd-y1Dxt5-F27MwQoWEWx8jgDwPgAtw'),
});

export type IConfigSchema = z.infer<typeof configSchema>;

/**
 * Config class
 */
export class Config {
  private static instance: Config;
  private config: z.infer<typeof configSchema>;

  private constructor() {
    try {
      const rawConfig: unknown = {
        BE_URL: import.meta.env.VITE_BE_URL,
        NODE_ENV: import.meta.env.MODE,
      };

      this.config = configSchema.parse(rawConfig);
    } catch (err) {
      if (import.meta.env.MODE == 'development') console.error(err);
      throw new Error('Invalid configuration');
    }
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public get<T extends keyof IConfigSchema>(key: T): IConfigSchema[T] {
    return this.config[key];
  }
}
