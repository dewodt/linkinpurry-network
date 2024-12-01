import { inject, injectable } from 'inversify';

import { logger } from '@/core/logger';
import type { TSocket, TSocketServer } from '@/core/websocket';
import { ChatService } from '@/services/chat-service';

import type { IWebSocketGateway } from './gateway';

export interface IChatGateway extends IWebSocketGateway {
  handleJoinChatRooms(socket: TSocket, io: TSocketServer): void;
  handleGetStatus(socket: TSocket, io: TSocketServer): void;
  handleSendMessage(socket: TSocket, io: TSocketServer): void;
  handleSendTyping(socket: TSocket, io: TSocketServer): void;
  handleStopTyping(socket: TSocket, io: TSocketServer): void;
}

@injectable()
export class ChatGateway implements IChatGateway {
  // IoC Container
  public static readonly Key = Symbol.for('ChatGateway');

  // State for mapping user id and socket id
  // 1 user id can have multiple socket ids
  private userSocketsMap = new Map<string, Set<string>>();

  constructor(@inject(ChatService.Key) private chatService: ChatService) {}

  handleConnection(socket: TSocket, io: TSocketServer) {
    logger.info(`New socket connection from ${socket.handshake.address}`);
  }

  handleDisconnect(socket: TSocket, io: TSocketServer): void {}
}
