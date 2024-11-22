import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { Container } from 'inversify';
import 'reflect-metadata';

import type { JWTPayload } from '@/dto/auth-dto';
import { Database } from '@/infrastructures/database/database';
import { AuthRoute } from '@/routes/auth-route';
import { type IRoute } from '@/routes/route';

import { Config } from './config';
import { DependencyContainer } from './container';
import { logger } from './logger';

/**
 * Global Hono Generic Config
 */
export interface IGlobalContext {
  Variables: {
    user: JWTPayload; // typing not null / undefined, ensured by middleware
  };
}

/**
 * Application class
 */
export class App {
  private app: Hono<IGlobalContext>;
  private container: Container;

  constructor() {
    this.app = new Hono();
    this.container = new DependencyContainer().getContainer();

    // Setup
    this.setup();
  }

  /**
   * Setup application
   * Register middlewares and routes
   */
  private setup(): void {
    // Cors
    this.app.use(cors());

    // Helmet
    this.app.use(secureHeaders());

    // Request / Response logger
    this.app.use(honoLogger((str: string, ...rest) => logger.info(str, ...rest)));

    // Global error handler
    this.app.use(async (c, next) => {
      await next();
      if (c.error) {
        return c.json({ error: c.error.message }, 500);
      }
    });

    // Register routes
    const routeKeys: symbol[] = [AuthRoute.Key];
    const routes: IRoute[] = routeKeys.map((key: symbol) => this.container.get<IRoute>(key));
    routes.forEach((route: IRoute) => route.register(this.app));
  }

  /**
   * Start server
   */
  public listen(): void {
    // Connect to database
    const database = this.container.get<Database>(Database.Key);
    database.connect();

    // Get config & port
    const config = this.container.get<Config>(Config.Key);
    const port = config.get('PORT');

    // Start server
    serve({
      fetch: this.app.fetch,
      port,
    });
  }

  /**
   * Cleanup
   */
  public async cleanup(): Promise<void> {
    // Disconnect from database
    const database = this.container.get<Database>(Database.Key);
    await database.disconnect();
  }
}
