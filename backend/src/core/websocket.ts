import type { ServerType } from '@hono/node-server';
import { inject, injectable } from 'inversify';
import { type DefaultEventsMap, Namespace, Socket, Server as SocketServer } from 'socket.io';

import type { JWTPayload } from '@/dto/auth-dto';
import { ChatGateway } from '@/gateways/chat-gateway';
import { AuthMiddleware } from '@/middlewares/auth-middleware';

import { Config } from './config';
import { logger } from './logger';

export interface SocketData {
  user?: JWTPayload;
}

export type TSocketServer = SocketServer<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

export type TSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;

@injectable()
export class WebSocketServer {
  // IoC Container
  public static readonly Key = Symbol.for('WebSocketServer');

  // Socket io server + namespaces
  private io: TSocketServer | null = null;
  private chatNamespace: Namespace | null = null;

  // Dependencies
  constructor(
    @inject(Config.Key) private readonly config: Config,
    @inject(AuthMiddleware.Key) private readonly authMiddleware: AuthMiddleware,
    @inject(ChatGateway.Key) private readonly chatGateway: ChatGateway
  ) {}

  /**
   * Initialize socket.io server
   *
   * @param httpServer
   */
  public initialize(httpServer: ServerType): void {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: this.config.get('FE_URL'),
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // this.io.on('connection', (socket: TSocket) => {
    //   logger.info(`New socket connection from ${socket.handshake.address}`);

    //   socket.on('disconnect', () => {
    //     logger.info(`Socket disconnected from ${socket.handshake.address}`);
    //   });
    // });

    // Initialize chat namespace
    this.chatNamespace = this.io.of('/chat');
    this.chatNamespace.use(this.authMiddleware.authorizeSocket({ isPublic: false }));
    this.chatNamespace.on('connection', (socket: TSocket) => {
      // Handle connection
      logger.info(`New chat connection | ID:${socket.id} | FROM: ${socket.handshake.address}`);
      this.chatGateway.handleConnection(socket, this.io!);

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`Chat disconnected | ID:${socket.id} | FROM: ${socket.handshake.address}`);
        this.chatGateway.handleDisconnect(socket, this.io!);
      });
    });
  }

  /**
   * Get socket.io server instance
   *
   * @returns TSocketServer
   */
  public getIO(): TSocketServer {
    if (!this.io) {
      throw new Error('WebSocket server not initialized');
    }

    return this.io;
  }
}
