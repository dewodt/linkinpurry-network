import { Container, ContainerModule } from 'inversify';

import { ChatGateway } from '@/gateways/chat-gateway';
import { Database } from '@/infrastructures/database/database';
import { AuthMiddleware } from '@/middlewares/auth-middleware';
import { AuthRoute } from '@/routes/auth-route';
import { ChatRoute } from '@/routes/chat-route';
import { ConnectionRoute } from '@/routes/connection-route';
import { NotificationRoute } from '@/routes/notification';
import { UserRoute } from '@/routes/user-route';
import { AuthService } from '@/services/auth-service';
import { ChatService } from '@/services/chat-service';
import { ConnectionService } from '@/services/connection-service';
import { NotificationService } from '@/services/notification';
import { UserService } from '@/services/user-service';

import { Bucket } from './bucket';
import { Config } from './config';
import { WebSocketServer } from './websocket';

export class DependencyContainer {
  private container: Container;

  private coreModule: ContainerModule;
  private authModule: ContainerModule;
  private userModule: ContainerModule;
  private connectionModule: ContainerModule;
  private chatModule: ContainerModule;
  private notificationModule: ContainerModule;

  constructor() {
    // Initialize container
    this.container = new Container();

    // Core module
    this.coreModule = new ContainerModule((bind) => {
      bind(Config.Key).to(Config).inSingletonScope();
      bind(Database.Key).to(Database).inSingletonScope();
      bind(Bucket.Key).to(Bucket).inSingletonScope();
      bind(WebSocketServer.Key).to(WebSocketServer).inSingletonScope();
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

    // Chat module
    this.chatModule = new ContainerModule((bind) => {
      bind(ChatService.Key).to(ChatService).inSingletonScope();
      bind(ChatRoute.Key).to(ChatRoute).inSingletonScope();
      bind(ChatGateway.Key).to(ChatGateway).inSingletonScope();
    });

    // Notification module
    this.notificationModule = new ContainerModule((bind) => {
      bind(NotificationService.Key).to(NotificationService).inSingletonScope();
      bind(NotificationRoute.Key).to(NotificationRoute).inSingletonScope();
    });

    // Load modules
    this.container.load(this.coreModule);
    this.container.load(this.authModule);
    this.container.load(this.userModule);
    this.container.load(this.connectionModule);
    this.container.load(this.chatModule);
    this.container.load(this.notificationModule);
  }

  /**
   * @returns Containers
   */
  public getContainer(): Container {
    return this.container;
  }
}
