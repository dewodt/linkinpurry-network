import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { Container } from 'inversify';
import 'reflect-metadata';

import { Database } from '@/infrastructures/database/database';
import { AuthRoute } from '@/routes/auth-route';
import { IRoute } from '@/routes/route';

import { Config } from './config';
import { DependencyContainer } from './container';
import { logger } from './logger';

/**
 * Application class
 */
export class App {
  private app: express.Application;
  private container: Container;

  constructor() {
    // Initialize state
    this.app = express();
    this.container = new DependencyContainer().getContainer();

    // Setup
    this.setup();
  }

  /**
   * Setup application
   * Register middlewares and routes
   */
  private setup(): void {
    // Connect to database

    // Global middlewares
    this.app.use(cookieParser());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(helmet());

    // Request logger
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });

    // Error handler
    this.app.use(
      (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        logger.error(err.stack || err.message);
        res.status(500).send('Something broke!');
      }
    );

    // Routes
    const routeKeys: symbol[] = [AuthRoute.Key];
    const routes: IRoute[] = routeKeys.map((key: symbol) => this.container.get<IRoute>(key));
    routes.forEach((route: IRoute) => route.register(this.app));
  }

  public listen(): void {
    // Connect to database
    const database = this.container.get<Database>(Database.Key);
    logger.info('Connecting to database');
    database.connect();
    logger.info('Connected to database');

    // Get config
    const config = this.container.get<Config>(Config.Key);

    // Start server
    this.app.listen(config.get('PORT'), () => {
      logger.info(`Server is running on http://localhost:${config.get('PORT')}`);
    });
  }

  public async cleanup(): Promise<void> {
    // Disconnect from database
    logger.info('Disconnecting from database');
    const database = this.container.get<Database>(Database.Key);
    logger.info('Disconnected from database');
    await database.disconnect();
  }
}
