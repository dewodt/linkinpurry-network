import type { Prisma, PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { Config } from '@/core/config';
import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import type { PagePaginationResponseMeta } from '@/dto/common';
import { Database } from '@/infrastructures/database/database';
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

  decideConnectionRequest(
    currentUserId: bigint,
    fromUserId: bigint,
    action: ConnectionRequestDecision
  ): Promise<void>;
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
    @inject(Config.Key) private config: Config,
    @inject(Database.Key) private database: Database
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

      const connectionPromise = this.prisma.connection.findMany({
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

              // find connection status of user to currentUser
              ...(currentUserId && {
                receivedConnections: {
                  select: {
                    fromId: true, // or toId, is ok
                  },
                  where: {
                    fromId: currentUserId, // or toId, is ok
                  },
                  take: 1,
                },
              }),

              // find connection status of currentUser to user
              ...(currentUserId && {
                sentConnections: {
                  select: {
                    fromId: true,
                  },
                  where: {
                    fromId: currentUserId, // pending defintiion: from the PoV of sender
                  },
                  take: 1,
                },
              }),
            },
          },
        },
      });

      const metaPromise = this.prisma.connection.count({
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

      const [rawConnections, totalItems] = await Promise.all([connectionPromise, metaPromise]);

      const meta: PagePaginationResponseMeta = {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      };

      const connections = rawConnections.map((connection) => {
        const toUser = connection.toUser;
        const fullURL =
          toUser.profilePhotoPath.length > 0
            ? `${this.config.get('BE_URL')}${toUser.profilePhotoPath}`
            : '';

        return {
          id: toUser.id,
          username: toUser.username,
          fullName: toUser.fullName || 'N/A',
          profilePhotoPath: fullURL,
          workHistory: toUser.workHistory,
          connectionStatus: currentUserId
            ? toUser.receivedConnections.length > 0
              ? ConnectionStatus.ACCEPTED
              : toUser.sentConnections.length > 0
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

  async decideConnectionRequest(
    currentUserId: bigint,
    fromUserId: bigint,
    action: ConnectionRequestDecision
  ) {
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
   */

  // /**
  //  * Fetches connection requests sent to a specific user.
  //  *
  //  * @param userId - The ID of the user to whom the connection requests are sent.
  //  * @returns A promise that resolves to an array of connection request objects.
  //  * Each object contains the following properties:
  //  * - userId: The ID of the user who requested the connection.
  //  * - requestId: The ID of the connection request.
  //  * - username: The username of the user who requested the connection.
  //  * - email: The email of the user who requested the connection.
  //  *
  //  * @throws Will throw an error if the connection requests cannot be fetched.
  //  */
  // async getConnectionRequestTo(userId: bigint): Promise<any[]> {
  //   const prisma = this.database.getPrisma();

  //   try {
  //     logger.info(`Fetching connection requests for userId: ${userId.toString()}`);

  //     // Fetch connection requests from the database
  //     const connectionRequests = await prisma.connectionRequest.findMany({
  //       where: {
  //         toId: userId,
  //       },
  //       select: {
  //         fromId: true,
  //         toId: true,
  //         createdAt: true, // for debugging/logging purposes
  //         fromUser: {
  //           select: {
  //             id: true,
  //             username: true,
  //             fullName: true,
  //             profilePhotoPath: true,
  //             workHistory: true,
  //             skills: true,
  //           },
  //         },
  //       },
  //     });

  //     // Transform the result into the desired structure
  //     return connectionRequests.map((connectionRequest) => {
  //       const fromUser = connectionRequest.fromUser;

  //       return {
  //         userId: fromUser.id.toString(), // ID of the user who requested the connection
  //         requestId: connectionRequest.toId.toString(), // ID of the connection request
  //         username: fromUser.username, // Username of the user
  //         name: fromUser.fullName || 'N/A', // Full name, default to "N/A" if null
  //         profile_photo:
  //           fromUser.profilePhotoPath || 'https://example.com/default-profile-photo.jpg', // Default profile photo
  //         work_history: fromUser.workHistory || null, // Nullable work history
  //         skills: fromUser.skills || null, // Nullable skills
  //       };
  //     });
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       logger.error(`Error in getConnectionRequestTo: ${error.message}`);
  //       logger.error(`Stack Trace: ${error.stack}`);
  //     }

  //     throw ExceptionFactory.internalServerError('Failed to fetch connection requests');
  //   }
  // }
}
