import { inject, injectable } from 'inversify';

import { logger } from '@/core/logger';
import type { TSocket, TSocketServer } from '@/core/websocket';
import {
  type IGetStatusResponseDataDto,
  getStatusRequestDataDto,
  joinChatRoomsRequestDataDto,
} from '@/dto/chat-dto';
import { ResponseDtoFactory } from '@/dto/common';
import { ChatService } from '@/services/chat-service';
import { UserStatus } from '@/utils/enum';
import { Utils } from '@/utils/utils';

import type { IWebSocketGateway, SocketCallbackFunction, SocketListenerFunction } from './gateway';

@injectable()
export class ChatGateway implements IWebSocketGateway {
  // IoC Container
  public static readonly Key = Symbol.for('ChatGateway');

  // State for mapping user id and socket id
  // 1 user id can have multiple socket ids
  private userSocketsMap = new Map<bigint, Set<string>>();

  constructor(@inject(ChatService.Key) private chatService: ChatService) {}

  /**
   * Handle connection
   * called when a new socket connection is established
   *
   * @param socket
   * @param io
   */
  public async handleConnection(socket: TSocket, io: TSocketServer) {
    logger.info(`New chat connection | ID:${socket.id} | FROM: ${socket.handshake.address}`);

    // Notify that current user is online
    this.notifyOnline(socket, io);

    // Register other events
    socket.on('disconnect', () => this.handleDisconnect(socket, io));
    socket.on('joinChatRooms', this.handleJoinChatRooms(socket, io));
    socket.on('getStatus', this.handleGetStatus(socket, io));
    // socket.on('sendMessage', this.handleSendMessage(socket, io));
    // socket.on('sendTyping', this.handleSendTyping(socket, io));
    // socket.on('stopTyping', this.handleStopTyping(socket, io));
  }

  /**
   * Handle disconnect
   *
   * @param socket
   * @param io
   */
  private async handleDisconnect(socket: TSocket, io: TSocketServer) {
    try {
      const currentUserId = socket.data.user?.userId as bigint; // assured by authorizeSocket middleware

      // Update socket id from userid - sockets mapping
      const userSockets = this.userSocketsMap.get(currentUserId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          // empty
          this.userSocketsMap.delete(currentUserId);
        }
      }

      // Notify offline to other users
      const onlineUserIds = Array.from(new Set(this.userSocketsMap.keys()));
      const currentUserOnlineRooms = await this.chatService.getCurrentUserOnlineRoomIds(
        currentUserId,
        onlineUserIds
      );

      const response = ResponseDtoFactory.createSuccessDataResponseDto('User is now offline', {
        userId: currentUserId.toString(),
      });

      socket.to(currentUserOnlineRooms).emit('userOffline', response);

      logger.info(`Chat disconnected | ID:${socket.id} | FROM: ${socket.handshake.address}`);
    } catch (error) {
      if (error instanceof Error) {
        socket.emit('error', error.message);
        return;
      }

      socket.emit('error', 'Unknown error');
    }
  }

  /**
   * Notify online users
   *
   * @param socket
   * @param io
   */
  private async notifyOnline(socket: TSocket, io: TSocketServer) {
    try {
      // Add socket id to userid - sockets mapping
      const currentUserId = socket.data.user?.userId as bigint; // assured by authorizeSocket middleware
      const userSockets = this.userSocketsMap.get(currentUserId);
      if (userSockets) {
        userSockets.add(socket.id);
      } else {
        this.userSocketsMap.set(currentUserId, new Set([socket.id]));
      }

      // Notify online users
      const onlineUserIds = Array.from(new Set(this.userSocketsMap.keys()));

      const currentUserOnlineRooms = await this.chatService.getCurrentUserOnlineRoomIds(
        currentUserId,
        onlineUserIds
      );

      const response = ResponseDtoFactory.createSuccessDataResponseDto('User is now online', {
        user_id: currentUserId.toString(),
      });

      socket.to(currentUserOnlineRooms).emit('userOnline', response);
    } catch (error) {
      if (error instanceof Error) {
        socket.emit('error', error.message);
        return;
      }

      socket.emit('error', 'Unknown error');
    }
  }

  /**
   * Handle join chat rooms
   *
   * @param socket
   * @param io
   */
  private handleJoinChatRooms(socket: TSocket, io: TSocketServer): SocketListenerFunction {
    return async (data: unknown, callback: SocketCallbackFunction) => {
      // Validate data
      const joinChatRoomsRequestData = await joinChatRoomsRequestDataDto.safeParseAsync(data);
      if (!joinChatRoomsRequestData.success) {
        const { message, errorFields } = Utils.parseZodErrorResult(joinChatRoomsRequestData.error);
        const responseDto = ResponseDtoFactory.createErrorResponseDto(message, errorFields);
        callback(responseDto);
        return;
      }

      try {
        // Join chat rooms
        const currentUserId = socket.data.user?.userId as bigint; // assured by authorizeSocket middleware
        const targetUserIds = joinChatRoomsRequestData.data.userIds;

        const roomIds = await this.chatService.getChatRooms(currentUserId, targetUserIds);
        socket.join(roomIds);

        const responseDto = ResponseDtoFactory.createSuccessResponseDto('Joined chat rooms');
        callback(responseDto);
      } catch (error) {
        if (error instanceof Error) {
          const responseDto = ResponseDtoFactory.createErrorResponseDto(error.message);
          callback(responseDto);
          return;
        }

        const responseDto = ResponseDtoFactory.createErrorResponseDto('Unknown error');
        callback(responseDto);
      }
    };
  }

  private handleGetStatus(socket: TSocket, io: TSocketServer): SocketListenerFunction {
    return async (data: unknown, callback: SocketCallbackFunction) => {
      // Validate data
      const getStatusRequestData = await getStatusRequestDataDto.safeParseAsync(data);
      if (!getStatusRequestData.success) {
        const { message, errorFields } = Utils.parseZodErrorResult(getStatusRequestData.error);
        const responseDto = ResponseDtoFactory.createErrorResponseDto(message, errorFields);
        callback(responseDto);
        return;
      }

      // Check if user can access chat & get room id
      try {
        const currentUserId = socket.data.user?.userId as bigint; // assured by authorizeSocket middleware
        const otherUserId = getStatusRequestData.data.userId;

        await this.chatService.getChatRoom(currentUserId, otherUserId);

        // Get status
        const otherUserSocket = this.userSocketsMap.get(otherUserId);
        const otherUserStatus = otherUserSocket ? UserStatus.ONLINE : UserStatus.OFFLINE;

        const responseData: IGetStatusResponseDataDto = {
          status: otherUserStatus,
        };
        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Get status successful',
          responseData
        );
        callback(responseDto);
      } catch (error) {
        if (error instanceof Error) {
          const responseDto = ResponseDtoFactory.createErrorResponseDto(error.message);
          callback(responseDto);
          return;
        }

        const responseDto = ResponseDtoFactory.createErrorResponseDto('Unknown error');
        callback(responseDto);
      }
    };
  }

  private async handleSendMessage(socket: TSocket, io: TSocketServer) {}

  private async handleSendTyping(socket: TSocket, io: TSocketServer) {}

  private async handleStopTyping(socket: TSocket, io: TSocketServer) {}
}
