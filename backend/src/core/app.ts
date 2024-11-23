import { serve } from '@hono/node-server';
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
import type { IRoute } from '@/routes/route';

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
    // Cors
    this.app.use(
      cors({
        origin: this.config.get('FE_URL'),
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowHeaders: [
          'Content-Type',
          'X-XSRF-TOKEN',
          'Accept',
          'Origin',
          'X-Requested-With',
          'Authorization',
        ],
        exposeHeaders: ['Content-Length'],
        credentials: true,
        maxAge: 60 * 60 * 24, // 1 hour
      })
    );

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

    // Register all routers
    const routeKeys = [AuthRoute.Key];
    routeKeys.forEach((key) => this.container.get<IRoute>(key).register(this.app));

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
