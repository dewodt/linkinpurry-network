import { z } from 'zod';

/**
 * Create a singleton object to store enviroment variables
 */
export const configSchema = z.object({
  VITE_BE_URL: z.string({ message: 'BE_URL is required' }).min(1, { message: 'BE_URL is required' }).default('http://localhost:3000'),
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

  public static get<T extends keyof IConfigSchema>(key: T): IConfigSchema[T] {
    return this.instance.config[key];
  }
}
