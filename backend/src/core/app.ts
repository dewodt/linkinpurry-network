import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import 'reflect-metadata';

import { AuthRoute } from '@/routes/auth-route';
import { IRoute } from '@/routes/route';

import { Config } from './config';
import { DependencyContainer } from './container';

/**
 * Application class
 */
export class App {
  private app: express.Application;
  private container: DependencyContainer;

  constructor() {
    // Initialize state
    this.app = express();
    this.container = new DependencyContainer();

    // Setup
    this.setup();
  }

  /**
   * Setup application
   * Register middlewares and routes
   */
  private setup(): void {
    // Global middlewares
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(helmet());

    // Routes
    const routeKeys: symbol[] = [AuthRoute.Key];
    const routes: IRoute[] = routeKeys.map((key: symbol) =>
      this.container.getContainer().get<IRoute>(key)
    );
    routes.forEach((route: IRoute) => route.register(this.app));

    // Error handler
    this.app.use(
      (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
      }
    );
  }

  public listen(): void {
    // Get config
    const config = this.container.getContainer().get<Config>(Config.Key);

    // Start server
    this.app.listen(config.get('PORT'), () => {
      console.log(`Server is running on http://localhost:${config.get('PORT')}`);
    });
  }
}
