import { Container } from 'inversify';

import { Database } from '@/infrastructures/database/database';
import { AuthMiddleware } from '@/middlewares/auth-middleware';
import { AuthRoute } from '@/routes/auth-route';
import { AuthService } from '@/services/auth-service';

import { Config } from './config';

export class DependencyContainer {
  private container: Container;

  constructor() {
    this.container = new Container();
    this.registerDependencies();
  }

  /**
   * Register dependencies
   */
  private registerDependencies(): void {
    // Core
    this.container.bind<Config>(Config.Key).to(Config).inSingletonScope();
    this.container.bind<Database>(Database.Key).to(Database).inSingletonScope();

    // Services
    this.container.bind<AuthService>(AuthService.Key).to(AuthService).inSingletonScope();
    // Add more

    // Middleware
    this.container.bind<AuthMiddleware>(AuthMiddleware.Key).to(AuthMiddleware).inSingletonScope();

    // Routes
    this.container.bind<AuthRoute>(AuthRoute.Key).to(AuthRoute).inSingletonScope();
    // Add more
  }

  public getContainer(): Container {
    return this.container;
  }
}
