// infrastructures/websocket/websocket-server.ts
import type { ServerType } from '@hono/node-server';
import { inject, injectable } from 'inversify';
import { Socket, Server as SocketIOServer } from 'socket.io';

import { Config } from './config';
import { logger } from './logger';

@injectable()
export class WebSocketServer {
  public static readonly Key = Symbol.for('WebSocketServer');

  private io: SocketIOServer | null = null;

  constructor(@inject(Config.Key) private config: Config) {}

  /**
   * Initialize socket.io server
   *
   * @param httpServer
   */
  public initialize(httpServer: ServerType): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: this.config.get('FE_URL'),
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Initialize connection handling
    this.io.on('connection', (socket) => {
      this.handleConnect(socket);
    });
  }

  /**
   * Handle client connection
   *
   * @param socket
   */
  private handleConnect(socket: Socket): void {
    logger.info(`Client connected: ${socket.id}`);
  }

  /**
   * Get socket.io server instance
   *
   * @returns SocketIOServer
   */
  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('WebSocket server not initialized');
    }

    return this.io;
  }
}
