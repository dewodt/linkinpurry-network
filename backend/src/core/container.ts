import { Container, ContainerModule } from 'inversify';

import { Database } from '@/infrastructures/database/database';
import { AuthMiddleware } from '@/middlewares/auth-middleware';
import { AuthRoute } from '@/routes/auth-route';
import { ConnectionRoute } from '@/routes/connection-route';
import { UserRoute } from '@/routes/user-route';
import { AuthService } from '@/services/auth-service';
import { ConnectionService } from '@/services/connection-service';
import { UploadService } from '@/services/upload-service';
import { UserService } from '@/services/user-service';

import { Config } from './config';

export class DependencyContainer {
  private container: Container;

  private coreModule: ContainerModule;
  private authModule: ContainerModule;
  private userModule: ContainerModule;
  private connectionModule: ContainerModule;

  constructor() {
    // Initialize container
    this.container = new Container();

    // Core module
    this.coreModule = new ContainerModule((bind) => {
      bind(Config.Key).to(Config).inSingletonScope();
      bind(Database.Key).to(Database).inSingletonScope();
      bind(UploadService.Key).to(UploadService).inSingletonScope();
    });

    // Auth module
    this.authModule = new ContainerModule((bind) => {
      bind(AuthMiddleware.Key).to(AuthMiddleware).inSingletonScope();
      bind(AuthService.Key).to(AuthService).inSingletonScope();
      bind(AuthRoute.Key).to(AuthRoute).inSingletonScope();
    });

    // User module
    this.userModule = new ContainerModule((bind) => {
      bind(UserService.Key).to(UserService).inSingletonScope();
      bind(UserRoute.Key).to(UserRoute).inSingletonScope();
    });

    // Connection module
    this.connectionModule = new ContainerModule((bind) => {
      bind(ConnectionService.Key).to(ConnectionService).inSingletonScope();
      bind(ConnectionRoute.Key).to(ConnectionRoute).inSingletonScope();
    });

    // Load modules
    this.container.load(this.coreModule);
    this.container.load(this.authModule);
    this.container.load(this.userModule);
  }

  /**
   * @returns Containers
   */
  public getContainer(): Container {
    return this.container;
  }
}
