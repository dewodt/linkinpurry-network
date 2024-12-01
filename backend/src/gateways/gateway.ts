import type { TSocket, TSocketServer } from '@/core/websocket';

export interface IWebSocketGateway {
  handleConnection(socket: TSocket, io: TSocketServer): void;
  handleDisconnect(socket: TSocket, io: TSocketServer): void;
}
