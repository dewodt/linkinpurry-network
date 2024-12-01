import { Prisma, type PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import { Database } from '@/infrastructures/database/database';

import type { IService } from './service';

export interface IChatService extends IService {
  saveMessage(
    currentUserId: bigint,
    otherUserId: bigint,
    message: string
  ): Promise<Prisma.ChatGetPayload<{}>>;

  canUserAccessChat(currentUserId: bigint, otherUserId: bigint): Promise<boolean>;

  canUserAccessChats(currentUserId: bigint, otherUserIds: bigint[]): Promise<boolean>;

  getChatInbox(
    currentUserId: bigint,
    search: string | undefined,
    cursor: bigint | undefined,
    limit: number
  ): Promise<{
    inboxes: {
      other_user_id: bigint;
      other_user_username: string;
      other_user_full_name: string;
      other_user_profile_photo_path: string;
      latest_message_id: bigint;
      latest_message_timestamp: Date;
      latest_message: string;
    }[];
    meta: {
      cursor: bigint | undefined;
      nextCursor: bigint | undefined;
      limit: number;
    };
  }>;

  getChatHistory(
    currentUserId: bigint,
    otherUserId: bigint,
    cursor: bigint | undefined,
    limit: number
  ): Promise<{
    history: {
      id: bigint;
      message: string;
      fromId: bigint;
      toId: bigint;
      timestamp: Date;
    }[];
    meta: {
      cursor: bigint | undefined;
      nextCursor: bigint | undefined;
      limit: number;
    };
  }>;
}

@injectable()
export class ChatService implements IChatService {
  // IoC key
  static readonly Key = Symbol.for('ChatService');

  private prisma: PrismaClient;

  constructor(@inject(Database.Key) private database: Database) {
    this.prisma = this.database.getPrisma();
  }

  /**
   * Save new message
   */
  async saveMessage(currentUserId: bigint, otherUserId: bigint, message: string) {
    // Try to message themselves
    if (currentUserId === otherUserId)
      throw ExceptionFactory.badRequest('You cannot send message to yourself');

    // Check if user is connected to other user
    let isConnected = false;

    try {
      const connection = await this.prisma.connection.findFirst({
        where: {
          OR: [
            { fromId: currentUserId, toId: otherUserId },
            { fromId: otherUserId, toId: currentUserId },
          ],
        },
        select: { fromId: true, toId: true },
      });

      if (connection) isConnected = true;
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to check connection existence');
    }

    if (!isConnected)
      throw ExceptionFactory.badRequest(
        'You are not connected to other user or other user does not exist'
      );

    // Save message
    try {
      const newChat = await this.prisma.chat.create({
        data: {
          fromId: currentUserId,
          toId: otherUserId,
          message,
        },
      });

      return newChat;
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to save message');
    }
  }

  /**
   *  Check if the user is trying to get chat history of themselves
   *
   * @param currentUserId
   * @param otherUserId
   * @returns boolean
   * @throws CustomException
   */
  async canUserAccessChat(currentUserId: bigint, otherUserId: bigint) {
    // Check if the user is trying to get chat history of themselves
    if (currentUserId === otherUserId)
      throw ExceptionFactory.badRequest('You cannot get chat history of yourself');

    // Check if connected to other user
    let isConnected = false;

    try {
      const connection = await this.prisma.connection.findFirst({
        where: {
          OR: [
            { fromId: currentUserId, toId: otherUserId },
            { fromId: otherUserId, toId: currentUserId },
          ],
        },
        select: { fromId: true, toId: true },
      });

      if (connection) isConnected = true;
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to check connection existence');
    }

    if (!isConnected)
      throw ExceptionFactory.badRequest(
        'You are not connected to other user or other user does not exist'
      );

    return true;
  }

  /**
   * Validate if user can chat to an array of users
   * @param currentUserId
   * @param otherUserIds
   * @returns boolean
   * @throws CustomException
   */
  async canUserAccessChats(currentUserId: bigint, otherUserIds: bigint[]) {
    // Check if all connections exists
    let isAllConnectionsExist = false;

    try {
      const connections = await this.prisma.connection.findMany({
        where: {
          OR: otherUserIds.map((otherUserId) => ({
            fromId: currentUserId, // use currentUserId as pointer
            toId: otherUserId,
          })),
        },
        select: { fromId: true, toId: true },
      });

      if (connections.length === otherUserIds.length) isAllConnectionsExist = true;
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to check connection existence');
    }

    if (!isAllConnectionsExist)
      throw ExceptionFactory.badRequest('You are not connected to all other users');

    return true;
  }

  /**
   * Get chat inboxes
   * gets the list of current user chat inbox: chat of connected users that have atleast one message
   * Uses cursor based pagination. Cursor is based on id of the latest message of each chat (note that higher id means higher timestamp)
   * Note that an entry in an inbox is a one-to-one relation ship with the latest message, so inbox can be represented using message
   *
   * @param currentUserId
   * @param search (chat content)
   * @param cursor (optional for first page), chat id
   * @param limit
   */
  async getChatInbox(
    currentUserId: bigint,
    search: string | undefined,
    cursor: bigint | undefined,
    limit: number
  ) {
    // dont think its feasible to use prisma here
    // await this.prisma.chat.findMany({
    //   where: {
    //     OR: [{ fromId: currentUserId }, { toId: currentUserId }],
    //   },
    //   orderBy: {

    //     id: 'desc', // higher id means higher timestamp
    //   },
    //   cursor: cursor ? { id: cursor } : undefined,
    //   take: limit + 1,
    // });

    try {
      const inboxes = await this.prisma.$queryRaw<
        Array<{
          other_user_id: bigint;
          other_user_full_name: string;
          other_user_username: string;
          other_user_profile_photo_path: string;
          latest_message_id: bigint;
          latest_message_timestamp: Date;
          latest_message: string;
        }>
      >`
        -- Get current user's connections (connection is bidrectional, use from_id for pointer)
        WITH current_user_connections AS (
          SELECT
            c.created_at,
            c.to_id as other_user_id
          FROM connection c
          WHERE c.from_id = ${currentUserId}
        ),
        -- Get all messages of the current user that has a search value
        current_user_matching_messages AS (
          SELECT
            ch.id,
            ch.timestamp,
            ch.from_id,
            ch.to_id,
            ch.message,
            CASE 
              WHEN ch.from_id = ${currentUserId} THEN ch.to_id 
              ELSE ch.from_id 
            END as other_user_id
          FROM chat ch
          WHERE
            (ch.from_id = ${currentUserId} OR ch.to_id = ${currentUserId})
            ${search ? Prisma.sql`AND (ch.message ILIKE ${`%${search}%`})` : Prisma.sql``}
        ),
        -- Get the latest message of each chat between current user and other user
        matching_messages_inbox AS (
          SELECT
            DISTINCT ON (other_user_id)
            *
          FROM current_user_matching_messages cu
          ORDER BY
            other_user_id,
            cu.id DESC
        )
        -- Get the other user data for each matching message inbox, also verify that the other user is connected
        SELECT
          u.id as other_user_id,
          u.username as other_user_username,
          u.full_name as other_user_full_name,
          u.profile_photo_path as other_user_profile_photo_path,
          mm.id as latest_message_id,
          mm.timestamp as latest_message_timestamp,
          mm.message as latest_message
        FROM
          current_user_connections cuc
          JOIN matching_messages_inbox mm ON mm.other_user_id = cuc.other_user_id
          JOIN users u ON u.id = mm.other_user_id
        WHERE
          ${cursor ? Prisma.sql`mm.id <= ${cursor}` : Prisma.sql`TRUE`}
        ORDER BY mm.id DESC
        LIMIT ${limit} + 1
      `;

      let nextCursor: bigint | undefined;
      if (inboxes.length > limit) {
        const nextInbox = inboxes.pop();
        if (nextInbox) nextCursor = nextInbox.latest_message_id;
      }

      return {
        inboxes,
        meta: {
          cursor,
          nextCursor,
          limit,
        },
      };
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to fetch chat inbox');
    }
  }

  /**
   * Get chat history
   *
   * @param currentUserId (current user)
   * @param cursor (optional for first page)
   * @param limit
   */
  async getChatHistory(
    currentUserId: bigint,
    otherUserId: bigint,
    cursor: bigint | undefined,
    limit: number
  ) {
    //  Check if the user is trying to get chat history of themselves
    if (currentUserId === otherUserId)
      throw ExceptionFactory.badRequest('You cannot get chat history of yourself');

    // Check if connected to other user
    let isConnected = false;

    try {
      const connection = await this.prisma.connection.findFirst({
        where: {
          OR: [
            { fromId: currentUserId, toId: otherUserId },
            { fromId: otherUserId, toId: currentUserId },
          ],
        },
        select: { fromId: true, toId: true },
      });

      if (connection) isConnected = true;
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to check connection existence');
    }

    if (!isConnected)
      throw ExceptionFactory.badRequest(
        'You are not connected to other user or other user does not exist'
      );

    try {
      const history = await this.prisma.chat.findMany({
        select: {
          id: true,
          message: true,
          fromId: true,
          toId: true,
          timestamp: true,
        },
        where: {
          OR: [
            { fromId: currentUserId, toId: otherUserId },
            { fromId: otherUserId, toId: currentUserId },
          ],
        },
        orderBy: {
          id: 'desc', // higher id means higher timestamp
        },
        cursor: cursor ? { id: cursor } : undefined,
        take: limit + 1,
      });

      let nextCursor: bigint | undefined;
      if (history.length > limit) {
        const nextHistory = history.pop();
        if (nextHistory) nextCursor = nextHistory.id;
      }

      return {
        history,
        meta: {
          cursor,
          nextCursor,
          limit,
        },
      };
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to fetch chat history');
    }
  }
}
