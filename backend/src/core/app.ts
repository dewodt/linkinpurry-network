import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { Container } from 'inversify';
import 'reflect-metadata';

import type { JWTPayload } from '@/dto/auth-dto';
import { ResponseDtoFactory } from '@/dto/common';
import { Database } from '@/infrastructures/database/database';
import { AuthRoute } from '@/routes/auth-route';
import { ConnectionRoute } from '@/routes/connection-route';
import type { IRoute } from '@/routes/route';
import { UserRoute } from '@/routes/user-route';
import { ConnectionRoute } from '@/routes/connection-route';

import { Utils } from './../utils/utils';
import { Config } from './config';
import { DependencyContainer } from './container';
import { logger } from './logger';

/**
 * Global Hono Generic Config
 */
export interface IGlobalContext {
  Variables: {
    user?: JWTPayload;
  };
}

/**
 * Application class
 */
export class App {
  private app: OpenAPIHono<IGlobalContext>;
  private container: Container;

  private config: Config;
  private database: Database;

  constructor() {
    this.app = new OpenAPIHono<IGlobalContext>({
      defaultHook: (result, c) => {
        if (!result.success) {
          const errorFields = Utils.getErrorFieldsFromZodParseResult(result.error);
          const responseDto = ResponseDtoFactory.createErrorResponseDto(
            'Validation Error',
            errorFields
          );
          return c.json(responseDto, 400);
        }
      },
    });
    this.container = new DependencyContainer().getContainer();

    this.config = this.container.get<Config>(Config.Key);
    this.database = this.container.get<Database>(Database.Key);

    // Setup
    this.setup();
  }

  /**
   * Setup application
   * Register middlewares and routes
   */
  private setup(): void {
    /**
     * Middlewares
     */
    // CORS
    this.app.use(
      cors({
        origin: this.config.get('FE_URL'),
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowHeaders: ['Content-Type', 'Authorization'],
        exposeHeaders: ['Content-Range', 'X-Content-Range'],
        credentials: true,
        maxAge: 60 * 60 * 24, // 1 hour
      })
    );

    // Override default secure headers CORP for avatar bucket
    this.app.use('/bucket/avatar/*', secureHeaders({ crossOriginResourcePolicy: 'cross-origin' }));

    // Secure headers (default settings)
    this.app.use(secureHeaders());

    // Request & response logger (after passing through security middlewares)
    this.app.use(honoLogger((str: string, ...rest) => logger.info(str, ...rest)));

    // Global error handler
    this.app.use(async (c, next) => {
      await next();
      if (c.error) return c.json({ error: c.error.message }, 500);
    });

    /**
     * Routes
     */
    // Register static file routes
    this.app.use('/bucket/*', serveStatic({ root: './public' }));

    // Register all routers
    const routeKeys = [AuthRoute.Key, UserRoute.Key, ConnectionRoute.Key];
    routeKeys.forEach((key) => this.container.get<IRoute>(key).registerRoutes(this.app));

    // Docs swagger UI (public route)
    this.app.doc('/api/docs', {
      openapi: '3.0.0',
      info: {
        title: 'LinkinPurry API Documentation',
        version: '1.0.0',
      },
    });

    this.app.get('/docs', swaggerUI({ url: '/api/docs' }));
  }

  /**
   * Start server
   */
  public listen(): void {
    // Connect to database
    this.database.connect();

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
    await this.database.disconnect();

    // Add more if needed
  }
}
