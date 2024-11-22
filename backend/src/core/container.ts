import { Container } from 'inversify';

import { AuthController, IAuthController } from '@/controllers/auth-controller';
import { Database } from '@/infrastructures/database/database';
import { AuthMiddleware, IAuthMiddleware } from '@/middlewares/auth-middleware';
import { AuthRoute, IAuthRoute } from '@/routes/auth-route';
import { AuthService, IAuthService } from '@/services/auth-service';

import { Config } from './config';

export class DependencyContainer {
  private container: Container;

  constructor() {
    this.container = new Container();
    this.registerDependencies();
  }

  private registerDependencies(): void {
    // Core
    this.container.bind<Config>(Config.Key).to(Config).inSingletonScope();
    this.container.bind<Database>(Database.Key).to(Database).inSingletonScope();

    // Services
    this.container.bind<AuthService>(AuthService.Key).to(AuthService).inSingletonScope();

    // Middleware
    this.container.bind<IAuthMiddleware>(AuthMiddleware.Key).to(AuthMiddleware).inSingletonScope();

    // Controllers
    this.container.bind<IAuthController>(AuthController.Key).to(AuthController).inSingletonScope();

    // Routes
    this.container.bind<IAuthRoute>(AuthRoute.Key).to(AuthRoute).inSingletonScope();
  }

  public getContainer(): Container {
    return this.container;
  }
}
