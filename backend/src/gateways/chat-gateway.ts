import { inject, injectable } from 'inversify';
import type { Namespace } from 'socket.io';

import { logger } from '@/core/logger';
import type { TSocket, TSocketServer } from '@/core/websocket';
import {
  type ISendMessageResponseDataDto,
  type ISendTypingResponseDataDto,
  joinChatRoomsRequestDataDto,
  sendMessageRequestDataDto,
  sendStopTypingRequestDataDto,
  sendTypingRequestDataDto,
} from '@/dto/chat-dto';
import { ResponseDtoFactory } from '@/dto/common';
import { ChatService } from '@/services/chat-service';
import { Utils } from '@/utils/utils';

import type { IWebSocketGateway, SocketCallbackFunction, SocketListenerFunction } from './gateway';

@injectable()
export class ChatGateway implements IWebSocketGateway {
  // IoC Container
  public static readonly Key = Symbol.for('ChatGateway');

  // Store mapping of user and its socket ids (1 user can have multiple sockets)
  private userSocketsMap = new Map<bigint, Set<string>>(); // userId -> socketIds

  constructor(@inject(ChatService.Key) private readonly chatService: ChatService) {}

  private getUserRoom(userId: bigint): string {
    return `user-${userId}`;
  }

  private getChatRoom(userId: bigint, otherUserId: bigint): string {
    const userIdStr = [userId, otherUserId].sort().join('-');
    return `chat-${userIdStr}`;
  }

  private getUserId(socket: TSocket): bigint {
    return socket.data.user?.userId as bigint; // assured by authorizeSocket middleware
  }

  /**
   * Handle connection: called when a new socket connection is established
   * I.S. user is authenticated
   *
   * @param socket
   * @param io
   */
  public async handleConnection(socket: TSocket, nsp: Namespace, io: TSocketServer) {
    // Get current user id
    const currentUserId = this.getUserId(socket);

    // Add current user to online user map
    const userSockets = this.userSocketsMap.get(currentUserId);
    if (userSockets) {
      userSockets.add(socket.id);
    } else {
      this.userSocketsMap.set(currentUserId, new Set([socket.id]));
    }

    // Join user room
    const userRoom = this.getUserRoom(currentUserId);
    socket.join(userRoom);

    // Join chat rooms with current online user
    const onlineUserIds = Array.from(this.userSocketsMap.keys());
    const onlineConnectedUserIds = await this.chatService.getConnectedOnlineUsers(
      currentUserId,
      onlineUserIds
    );
    const chatRooms = onlineConnectedUserIds.map((otherUserId) =>
      this.getChatRoom(currentUserId, otherUserId)
    );
    socket.join(chatRooms);

    // if want to notify online, can do it here
    

    // Events
    socket.on('disconnect', () => this.handleDisconnect(socket, nsp, io));
    socket.on('joinChatRooms', this.handleJoinChatRooms(socket, nsp, io));
    socket.on('sendMessage', this.handleSendMessage(socket, nsp, io));
    socket.on('sendTyping', this.handleSendTyping(socket, nsp, io));
    socket.on('stopTyping', this.handleStopTyping(socket, nsp, io));

    logger.info(`New chat connection | ID:${socket.id} | FROM: ${socket.handshake.address}`);
  }

  /**
   * Handle disconnect
   *
   * @param socket
   * @param nsp
   */
  private async handleDisconnect(socket: TSocket, nsp: Namespace, io: TSocketServer) {
    try {
      // Get current user id
      const currentUserId = this.getUserId(socket);

      // Update socket id from userId - sockets mapping
      const userSockets = this.userSocketsMap.get(currentUserId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          // empty
          this.userSocketsMap.delete(currentUserId);
        }
      }

      // Notify offline to other users (if want to notify offline, can do it here)
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
   * Handle join chat rooms
   *
   * @param socket
   * @param nsp
   */
  private handleJoinChatRooms(
    socket: TSocket,
    nsp: Namespace,
    io: TSocketServer
  ): SocketListenerFunction {
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
        const currentUserId = this.getUserId(socket);
        const targetUserIds = joinChatRoomsRequestData.data.user_ids;

        await this.chatService.canUserChatMany(currentUserId, targetUserIds);
        const roomIds = targetUserIds.map((otherUserId) =>
          this.getChatRoom(currentUserId, otherUserId)
        );
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

  private handleSendMessage(
    socket: TSocket,
    nsp: Namespace,
    io: TSocketServer
  ): SocketListenerFunction {
    return async (data: unknown, callback: SocketCallbackFunction) => {
      // Validate data
      const sendMessageRequestData = await sendMessageRequestDataDto.safeParseAsync(data);
      if (!sendMessageRequestData.success) {
        const { message, errorFields } = Utils.parseZodErrorResult(sendMessageRequestData.error);
        const responseDto = ResponseDtoFactory.createErrorResponseDto(message, errorFields);
        callback(responseDto);
        return;
      }

      try {
        // Send message
        const fromUserId = this.getUserId(socket);
        const toUserId = sendMessageRequestData.data.to_user_id;

        const { newChat, fromUser, toUser } = await this.chatService.sendMessage(
          fromUserId,
          toUserId,
          sendMessageRequestData.data.message
        );

        // To receiver
        const toUserResponseData: ISendMessageResponseDataDto = {
          other_user_id: fromUserId.toString(),
          other_user_username: fromUser.username,
          other_user_full_name: fromUser.fullName,
          other_user_profile_photo_path: fromUser.profilePhotoPath,
          from_user_id: newChat.fromId.toString(),
          message_id: newChat.id.toString(),
          message: newChat.message,
          timestamp: newChat.timestamp.toISOString(),
        };
        const toUserResponseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Send message successful',
          toUserResponseData
        );
        const toUserRoom = this.getUserRoom(toUserId);
        socket.to(toUserRoom).emit('newMessage', toUserResponseDto);

        // To sender
        const fromUserResponseData: ISendMessageResponseDataDto = {
          other_user_id: toUserId.toString(),
          other_user_username: toUser.username,
          other_user_full_name: toUser.fullName,
          other_user_profile_photo_path: toUser.profilePhotoPath,
          from_user_id: newChat.fromId.toString(),
          message_id: newChat.id.toString(),
          message: newChat.message,
          timestamp: newChat.timestamp.toISOString(),
        };
        const fromUserResponseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Send message successful',
          fromUserResponseData
        );
        const fromUserRoom = this.getUserRoom(fromUserId);
        socket.broadcast.to(fromUserRoom).emit('newMessage', fromUserResponseDto);

        callback(fromUserResponseDto);
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

  private handleSendTyping(
    socket: TSocket,
    nsp: Namespace,
    io: TSocketServer
  ): SocketListenerFunction {
    return async (data: unknown, callback: SocketCallbackFunction) => {
      // Validate data
      const sendTypingRequestData = await sendTypingRequestDataDto.safeParseAsync(data);
      if (!sendTypingRequestData.success) {
        const { message, errorFields } = Utils.parseZodErrorResult(sendTypingRequestData.error);
        const responseDto = ResponseDtoFactory.createErrorResponseDto(message, errorFields);
        callback(responseDto);
        return;
      }

      try {
        // Send typing
        const fromUserId = this.getUserId(socket);
        const toUserId = sendTypingRequestData.data.to_user_id;

        await this.chatService.canUserChat(fromUserId, toUserId);

        // To other user
        const otherUserResponseData: ISendTypingResponseDataDto = {
          from_user_id: fromUserId.toString(),
        };
        const otherUserResponseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Other user is typing',
          otherUserResponseData
        );
        const toUserRoom = this.getUserRoom(toUserId);
        socket.to(toUserRoom).emit('typing', otherUserResponseDto);

        // To sender
        const fromUserResponseDto = ResponseDtoFactory.createSuccessResponseDto(
          'Typing successfully sent'
        );
        callback(fromUserResponseDto);
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

  private handleStopTyping(
    socket: TSocket,
    nsp: Namespace,
    io: TSocketServer
  ): SocketListenerFunction {
    return async (data: unknown, callback: SocketCallbackFunction) => {
      // Validate data
      const sendStopTypingRequestData = await sendStopTypingRequestDataDto.safeParseAsync(data);
      if (!sendStopTypingRequestData.success) {
        const { message, errorFields } = Utils.parseZodErrorResult(sendStopTypingRequestData.error);
        const responseDto = ResponseDtoFactory.createErrorResponseDto(message, errorFields);
        callback(responseDto);
        return;
      }

      try {
        // Send stop typing
        const fromUserId = this.getUserId(socket);
        const toUserId = sendStopTypingRequestData.data.to_user_id;

        await this.chatService.canUserChat(fromUserId, toUserId);

        // To other user
        const otherUserResponseData: ISendTypingResponseDataDto = {
          from_user_id: fromUserId.toString(),
        };
        const otherUserResponseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Other user stopped typing',
          otherUserResponseData
        );
        const toUserRoom = this.getUserRoom(toUserId);
        socket.to(toUserRoom).emit('stopTyping', otherUserResponseDto);

        // To sender
        const fromUserResponseDto = ResponseDtoFactory.createSuccessResponseDto(
          'Stop typing successfully sent'
        );
        callback(fromUserResponseDto);
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
}
