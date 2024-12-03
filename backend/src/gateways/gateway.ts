import type { Namespace } from 'socket.io';

import type { TSocket, TSocketServer } from '@/core/websocket';

export interface IWebSocketGateway {
  handleConnection(socket: TSocket, nsp: Namespace, io: TSocketServer): void;
}

export type SocketCallbackFunction = (...args: any[]) => void;

export type SocketListenerFunction = (...args: any[]) => void;
