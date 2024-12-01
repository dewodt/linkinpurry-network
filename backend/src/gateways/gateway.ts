import type { TSocket, TSocketServer } from '@/core/websocket';

export interface IWebSocketGateway {
  handleConnection(socket: TSocket, io: TSocketServer): void;
}

export type SocketCallbackFunction = (...args: any[]) => void;

export type SocketListenerFunction = (...args: any[]) => void;
