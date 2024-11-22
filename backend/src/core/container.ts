import { Container } from 'inversify';

import { AuthController } from '@/controllers/auth-controller';
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

    // Middleware
    this.container.bind<AuthMiddleware>(AuthMiddleware.Key).to(AuthMiddleware).inSingletonScope();

    // Controllers
    this.container.bind<AuthController>(AuthController.Key).to(AuthController).inSingletonScope();

    // Routes
    this.container.bind<AuthRoute>(AuthRoute.Key).to(AuthRoute).inSingletonScope();
  }

  public getContainer(): Container {
    return this.container;
  }
}
