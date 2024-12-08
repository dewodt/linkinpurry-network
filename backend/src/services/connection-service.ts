import type { Prisma, PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import type { PagePaginationResponseMeta } from '@/dto/common';
import { Database } from '@/infrastructures/database/database';
import { RedisClient } from '@/infrastructures/redis/redis';
import { ConnectionRequestDecision, ConnectionStatus } from '@/utils/enum';

import { type IService } from './service';

/**
 * Interface definition
 */
export interface IConnectionService extends IService {
  createConnectionRequest(
    currentUserId: bigint,
    userId: bigint
  ): Promise<{ finalState: ConnectionStatus.ACCEPTED | ConnectionStatus.PENDING }>;

  getConnectionsList(
    currentUserId: bigint | undefined,
    userId: bigint,
    search: string | undefined,
    page: number,
    limit: number
  ): Promise<{
    connections: {
      id: bigint;
      username: string;
      fullName: string;
      profilePhotoPath: string;
      workHistory: string | null;
      connectionStatus: ConnectionStatus;
    }[];
    meta: PagePaginationResponseMeta;
  }>;

  getPendingConnections(
    currentUserId: bigint,
    page: number,
    limit: number
  ): Promise<{
    requests: {
      id: bigint;
      username: string;
      fullName: string;
      profilePhotoPath: string;
      workHistory: string | null;
    }[];
    meta: PagePaginationResponseMeta;
  }>;

  decideConnectionRequest(
    currentUserId: bigint,
    fromUserId: bigint,
    action: ConnectionRequestDecision
  ): Promise<void>;

  unconnectUser(currentUserId: bigint, userId: bigint): Promise<void>;
}

/**
 * Service implementation
 */
@injectable()
export class ConnectionService implements IConnectionService {
  // IoC Key
  static readonly Key = Symbol.for('ConnectionService');

  private prisma: PrismaClient;

  // Inject dependencies
  constructor(
    @inject(Database.Key) private readonly database: Database,
    @inject(RedisClient.Key) private readonly redisClient: RedisClient
  ) {
    this.prisma = this.database.getPrisma();
  }

  /**
   * Request connect current user to user id
   * @param userId
   */
  async createConnectionRequest(currentUserId: bigint, userId: bigint) {
    // Check if the user is trying to connect to themselves
    if (currentUserId === userId)
      throw ExceptionFactory.badRequest('You cannot connect to yourself');

    // Check if user exists or no
    let isUserExist = false;

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      });

      if (user) isUserExist = true;
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to check user existence');
    }

    if (!isUserExist) throw ExceptionFactory.notFound('User not found');

    // Check if the connection already exists
    let isConnectionExist = false;

    try {
      // Note: each connection has 2 rows, A -> B and B -> A.
      const connection = await this.prisma.connection.findFirst({
        where: {
          OR: [
            { fromId: currentUserId, toId: userId },
            { fromId: userId, toId: currentUserId },
          ],
        },
        select: {
          fromId: true,
          toId: true,
        },
      });

      if (connection) isConnectionExist = true;
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to check connection existence');
    }

    if (isConnectionExist) throw ExceptionFactory.badRequest('You already connected to this user');

    // Check if connection request already exist (either from or to the user)
    let connectionRequest: Prisma.ConnectionRequestGetPayload<{
      select: { fromId: true; toId: true };
    }> | null = null;

    try {
      connectionRequest = await this.prisma.connectionRequest.findFirst({
        where: {
          OR: [
            { fromId: currentUserId, toId: userId },
            { fromId: userId, toId: currentUserId },
          ],
        },
        select: {
          fromId: true,
          toId: true,
        },
      });
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to check connection request existence');
    }

    // If connection request already exists by current user throw error
    if (connectionRequest && connectionRequest.fromId === currentUserId) {
      throw ExceptionFactory.badRequest('You have already sent a connection request');
    }

    // If connection request already exists by other user, accept the connection and delete the request
    if (connectionRequest && connectionRequest.fromId !== currentUserId) {
      try {
        // Use transaction
        await this.prisma.$transaction(async (tx) => {
          await Promise.all([
            // Remove the connection request from connection_request table
            tx.connectionRequest.delete({
              where: {
                fromId_toId: {
                  fromId: connectionRequest.fromId,
                  toId: connectionRequest.toId,
                },
              },
            }),

            // Add the connection to the connection table
            // Note connection is mutual, so we need to create 2 rows
            tx.connection.createMany({
              data: [
                {
                  fromId: currentUserId,
                  toId: userId,
                  createdAt: new Date(),
                }, // A -> B
                {
                  fromId: userId,
                  toId: currentUserId,
                  createdAt: new Date(),
                }, // B -> A
              ],
            }),
          ]);
        });

        // Invalidate the cache of both users (connection count of both users in profile updated)
        const profile1CachePrefix = `user-profile:${currentUserId}`;
        const profile2CachePrefix = `user-profile:${userId}`;
        const feedTimeline1CachePrefix = `feeds:${currentUserId}`;
        const feedTimeline2CachePrefix = `feeds:${userId}`;
        const [cnt1, cnt2, cnt3, cnt4] = await Promise.all([
          this.redisClient.deleteWithPrefix(profile1CachePrefix),
          this.redisClient.deleteWithPrefix(profile2CachePrefix),
          this.redisClient.deleteWithPrefix(feedTimeline1CachePrefix),
          this.redisClient.deleteWithPrefix(feedTimeline2CachePrefix),
        ]);
        if (cnt1 > 0) logger.info(`Cache invalidated (prefix): ${profile1CachePrefix}`);
        if (cnt2 > 0) logger.info(`Cache invalidated (prefix): ${profile2CachePrefix}`);
        if (cnt3 > 0) logger.info(`Cache invalidated (prefix): ${feedTimeline1CachePrefix}`);
        if (cnt4 > 0) logger.info(`Cache invalidated (prefix): ${feedTimeline2CachePrefix}`);
      } catch (error) {
        // Internal server error
        if (error instanceof Error) logger.error(error.message);

        throw ExceptionFactory.internalServerError('Failed to accept connection request');
      }

      // RETURN EARLY
      return { finalState: ConnectionStatus.ACCEPTED as const };
    }

    // If connection doesnt exists, create a new connection request
    try {
      await this.prisma.connectionRequest.create({
        data: {
          fromId: currentUserId,
          toId: userId,
          createdAt: new Date(),
        },
      });

      return { finalState: ConnectionStatus.PENDING as const };
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to create connection request');
    }
  }

  /**
   *  Get connection list of a certain user
   *
   * @param userID
   * @returns array of connections
   * @throws CustomException
   */
  async getConnectionsList(
    currentUserId: bigint | undefined,
    userId: bigint,
    search: string | undefined,
    page: number,
    limit: number
  ) {
    try {
      // Note: each connection has 2 rows, A -> B and B -> A.
      // Only need to search for one direction. Use userId for the *fromId* search
      // if currentUser id is not null, reutrn also the connection with the current user
      // order by connected time descending

      const totalItems = await this.prisma.connection.count({
        where: {
          AND: [
            {
              fromId: userId,
            },
            search
              ? {
                  OR: [
                    {
                      toUser: {
                        username: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                    },
                    {
                      toUser: {
                        fullName: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                    },
                  ],
                }
              : {},
          ],
        },
      });

      // Empty, early return
      if (totalItems === 0)
        return { connections: [], meta: { page, limit, totalItems, totalPages: 0 } };

      // Validate upper bound of page
      const totalPages = Math.ceil(totalItems / limit);
      if (page > totalPages) page = totalPages;

      const rawConnections = await this.prisma.connection.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          AND: [
            {
              fromId: userId,
            },
            search
              ? {
                  OR: [
                    {
                      toUser: {
                        username: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                    },
                    {
                      toUser: {
                        fullName: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                    },
                  ],
                }
              : {},
          ],
        },

        include: {
          toUser: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePhotoPath: true,
              workHistory: true,

              // TODO: benchmark which is faster using count or take
              ...(currentUserId
                ? {
                    _count: {
                      select: {
                        // find the connection status (pending/no)
                        receivedRequests: currentUserId
                          ? {
                              where: {
                                fromId: currentUserId,
                              },
                            }
                          : undefined,

                        // find the connection status (connected/no)
                        receivedConnections: currentUserId
                          ? {
                              where: {
                                fromId: currentUserId,
                              },
                            }
                          : undefined,
                      },
                    },
                  }
                : {}),
            },
          },
        },
      });

      const meta: PagePaginationResponseMeta = {
        page,
        limit,
        totalItems,
        totalPages,
      };

      const connections = rawConnections.map((connection) => {
        const toUser = connection.toUser;

        return {
          id: toUser.id,
          username: toUser.username,
          fullName: toUser.fullName || 'N/A',
          profilePhotoPath: toUser.profilePhotoPath,
          workHistory: toUser.workHistory,
          connectionStatus: currentUserId
            ? toUser._count.receivedConnections > 0
              ? ConnectionStatus.ACCEPTED
              : toUser._count.receivedRequests > 0
                ? ConnectionStatus.PENDING
                : ConnectionStatus.NONE
            : ConnectionStatus.NONE,
        };
      });

      return { connections, meta };
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to fetch connection list');
    }
  }

  /**
   * Get pending connection (incoming to current user)
   *
   * @param currentUserId
   */
  async getPendingConnections(currentUserId: bigint, page: number, limit: number) {
    try {
      // Get all pending connection request to current user
      const totalItems = await this.prisma.connectionRequest.count({
        where: {
          toId: currentUserId,
        },
      });

      // Empty, early return
      if (totalItems === 0)
        return { requests: [], meta: { page, limit, totalItems, totalPages: 0 } };

      // Validate upper bound of page
      const totalPages = Math.ceil(totalItems / limit);
      if (page > totalPages) page = totalPages;

      // Get all pending connection request to current user (paginated)
      const rawRequests = await this.prisma.connectionRequest.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          toId: currentUserId,
        },
        include: {
          fromUser: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePhotoPath: true,
              workHistory: true,
            },
          },
        },
      });

      // Map
      const meta: PagePaginationResponseMeta = {
        page,
        limit,
        totalItems,
        totalPages,
      };

      const requests = rawRequests.map((request) => {
        const fromUser = request.fromUser;

        return {
          id: fromUser.id,
          username: fromUser.username,
          fullName: fromUser.fullName || 'N/A',
          profilePhotoPath: fromUser.profilePhotoPath,
          workHistory: fromUser.workHistory,
        };
      });

      return { requests, meta };
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to fetch pending connections');
    }
  }

  /**
   * Decide connection request
   *
   * @param currentUserId
   * @param fromUserId
   * @param action
   */
  async decideConnectionRequest(
    currentUserId: bigint,
    fromUserId: bigint,
    action: ConnectionRequestDecision
  ) {
    // Check if the user is trying to accept/reject to themselves
    if (currentUserId === fromUserId)
      throw ExceptionFactory.badRequest('You cannot accept/reject to yourself');

    // Get request to current user from fromUserId
    let connectionRequest: Prisma.ConnectionRequestGetPayload<{}> | null = null;

    try {
      connectionRequest = await this.prisma.connectionRequest.findFirst({
        where: {
          fromId: fromUserId,
          toId: currentUserId,
        },
      });
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to check connection request existence');
    }

    // If connection request not found
    if (!connectionRequest) throw ExceptionFactory.notFound('Connection request not found');

    // Perform action based on 'accept' or 'reject'
    if (action === ConnectionRequestDecision.ACCEPT) {
      try {
        // Use transaction
        await this.prisma.$transaction(async (tx) => {
          await Promise.all([
            // Remove the connection request from connection_request table
            tx.connectionRequest.delete({
              where: {
                fromId_toId: {
                  fromId: fromUserId,
                  toId: currentUserId,
                },
              },
            }),

            // Add the connection to the connection table
            // Note connection is mutual, so we need to create 2 rows
            tx.connection.createMany({
              data: [
                {
                  fromId: fromUserId,
                  toId: currentUserId,
                  createdAt: new Date(),
                }, // A -> B
                {
                  fromId: currentUserId,
                  toId: fromUserId,
                  createdAt: new Date(),
                }, // B -> A
              ],
            }),
          ]);
        });

        // Invalidate the profile cache of both users
        const profile1CachePrefix = `user-profile:${currentUserId}`;
        const profile2CachePrefix = `user-profile:${fromUserId}`;
        const feedTimeline1CachePrefix = `feeds:${currentUserId}`;
        const feedTimeline2CachePrefix = `feeds:${fromUserId}`;
        const [cnt1, cnt2, cnt3, cnt4] = await Promise.all([
          this.redisClient.deleteWithPrefix(profile1CachePrefix),
          this.redisClient.deleteWithPrefix(profile2CachePrefix),
          this.redisClient.deleteWithPrefix(feedTimeline1CachePrefix),
          this.redisClient.deleteWithPrefix(feedTimeline2CachePrefix),
        ]);
        if (cnt1 > 0) logger.info(`Cache invalidated (prefix): ${profile1CachePrefix}`);
        if (cnt2 > 0) logger.info(`Cache invalidated (prefix): ${profile2CachePrefix}`);
        if (cnt3 > 0) logger.info(`Cache invalidated (prefix): ${feedTimeline1CachePrefix}`);
        if (cnt4 > 0) logger.info(`Cache invalidated (prefix): ${feedTimeline2CachePrefix}`);
      } catch (error) {
        // Internal server error
        if (error instanceof Error) logger.error(error.message);

        throw ExceptionFactory.internalServerError('Failed to accept connection request');
      }
    } else if (action === ConnectionRequestDecision.DECLINE) {
      try {
        // Remove the connection request from connection_request table
        await this.prisma.connectionRequest.delete({
          where: {
            fromId_toId: {
              fromId: fromUserId,
              toId: currentUserId,
            },
          },
        });
      } catch (error) {
        // Internal server error
        if (error instanceof Error) logger.error(error.message);

        throw ExceptionFactory.internalServerError('Failed to decline connection request');
      }
    }
  }

  /**
   * Unconnect a user from currentUser
   *
   * @param currentUserId
   * @param userId
   */
  async unconnectUser(currentUserId: bigint, userId: bigint) {
    // Check if the user is trying to unconnect to themselves
    if (currentUserId === userId)
      throw ExceptionFactory.badRequest('You cannot unconnect to yourself');

    // Check if the connection already exists
    let isConnectionExist = false;

    try {
      // Note: each connection has 2 rows, A -> B and B -> A.
      const connection = await this.prisma.connection.findFirst({
        where: {
          OR: [
            { fromId: currentUserId, toId: userId },
            { fromId: userId, toId: currentUserId },
          ],
        },
        select: {
          fromId: true,
          toId: true,
        },
      });

      if (connection) isConnectionExist = true;
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to check connection existence');
    }

    if (!isConnectionExist) throw ExceptionFactory.notFound('Connection not found');

    // Remove the connection, chat and everything related to the connection
    try {
      await this.prisma.$transaction(async (tx) => {
        await Promise.all([
          // Connection
          tx.connection.deleteMany({
            where: {
              OR: [
                { fromId: currentUserId, toId: userId },
                { fromId: userId, toId: currentUserId },
              ],
            },
          }),

          // Chat history
          tx.chat.deleteMany({
            where: {
              OR: [
                { fromId: currentUserId, toId: userId },
                { fromId: userId, toId: currentUserId },
              ],
            },
          }),
        ]);
      });

      // Invalidate the profile cache of both users
      const profile1CachePrefix = `user-profile:${currentUserId}`;
      const profile2CachePrefix = `user-profile:${userId}`;
      const timeline1CachePrefix = `feeds:${currentUserId}`;
      const timeline2CachePrefix = `feeds:${userId}`;
      const [cnt1, cnt2, cnt3, cnt4] = await Promise.all([
        this.redisClient.deleteWithPrefix(profile1CachePrefix),
        this.redisClient.deleteWithPrefix(profile2CachePrefix),
        this.redisClient.deleteWithPrefix(timeline1CachePrefix),
        this.redisClient.deleteWithPrefix(timeline2CachePrefix),
      ]);
      if (cnt1 > 0) logger.info(`Cache invalidated (prefix): ${profile1CachePrefix}`);
      if (cnt2 > 0) logger.info(`Cache invalidated (prefix): ${profile2CachePrefix}`);
      if (cnt3 > 0) logger.info(`Cache invalidated (prefix): ${timeline1CachePrefix}`);
      if (cnt4 > 0) logger.info(`Cache invalidated (prefix): ${timeline2CachePrefix}`);
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to unconnect user');
    }
  }
}
