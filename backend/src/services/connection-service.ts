import type { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sign, verify } from 'hono/jwt';
import type { CookieOptions } from 'hono/utils/cookie';
import { inject, injectable } from 'inversify';

import { Config } from '@/core/config';
import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import { type IListConnectionsBodyDto } from '@/dto/connection-dto';
import { Database } from '@/infrastructures/database/database';

import { type IService } from './service';

/**
 * Interface definition
 */
export interface IConnectionService extends IService {
  listConnection(userId: bigint): Promise<any[]>;
  decideConnection(
    userId: bigint,
    fromId: bigint,
    toId: bigint,
    action: 'accept' | 'reject'
  ): Promise<{ requestId: string; status: string }>;
  getConnectionRequestTo(userId: bigint): Promise<any[]>;
}

/**
 * Service implementation
 */
@injectable()
export class ConnectionService implements IConnectionService {
  // IoC Key
  static readonly Key = Symbol.for('ConnectionService');

  // Inject dependencies
  constructor(
    @inject(Config.Key) private config: Config,
    @inject(Database.Key) private database: Database
  ) {}

  /**
   *  ListCnnection method
   *
   * @param userID
   * @returns array of connections
   * @throws CustomException
   */
  async listConnection(userId: bigint): Promise<any[]> {
    const prisma = this.database.getPrisma();

    try {
      logger.info(`Fetching connections for userId: ${userId.toString()}`);

      // Fetch connections from the database
      const connections = await prisma.connection.findMany({
        where: {
          OR: [
            { fromId: userId }, // Pengguna sebagai pengirim koneksi
            { toId: userId }, // Pengguna sebagai penerima koneksi
          ],
        },
        select: {
          fromId: true,
          toId: true,
          fromUser: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          toUser: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      // Transform the result into the desired structure
      return connections.map((connection) => {
        const isFromUser = connection.fromId === userId;
        const connectedUser = isFromUser ? connection.toUser : connection.fromUser;

        return {
          userId: connectedUser.id.toString(),
          username: connectedUser.username,
          email: connectedUser.email,
        };
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error in listConnection: ${error.message}`);
        logger.error(`Stack Trace: ${error.stack}`);
      }

      throw ExceptionFactory.internalServerError('Failed to fetch connections');
    }
  }

  async decideConnection(
    userId: bigint,
    fromId: bigint,
    toId: bigint,
    action: 'accept' | 'reject'
  ) {
    const prisma = this.database.getPrisma();

    try {
      logger.info(
        `Processing connection decision: userId=${userId}, fromId=${fromId}, toId=${toId}, action=${action}`
      );

      // Fetch the connection request using both fromId and toId
      const connectionRequest = await prisma.connectionRequest.findUnique({
        where: {
          fromId_toId: {
            fromId: fromId,
            toId: toId,
          },
        },
      });

      if (!connectionRequest) {
        throw ExceptionFactory.badRequest('Connection request not found');
      }

      // Ensure the user is part of the request (the user must be the receiver of the request)
      if (connectionRequest.toId !== userId) {
        throw ExceptionFactory.badRequest('Unauthorized to decide on this request');
      }

      // Perform action based on 'accept' or 'reject'
      if (action === 'accept') {
        // Remove the connection request from connection_request table
        await prisma.connectionRequest.delete({
          where: {
            fromId_toId: {
              fromId: fromId,
              toId: toId,
            },
          },
        });

        // Add the connection to the connection table
        await prisma.connection.create({
          data: {
            fromId: connectionRequest.fromId,
            toId: connectionRequest.toId,
            createdAt: new Date(),
          },
        });

        logger.info('Connection accepted and moved to connection table.');
      } else if (action === 'reject') {
        // Remove the connection request from connection_request table
        await prisma.connectionRequest.delete({
          where: {
            fromId_toId: {
              fromId: fromId,
              toId: toId,
            },
          },
        });

        logger.info('Connection rejected and removed from connection_request table.');
      }

      // Return response with only requestId and status
      return {
        requestId: connectionRequest.toId.toString(), // Ensure the 'requestId' is correctly retrieved
        status: action === 'accept' ? 'accepted' : 'rejected', // Set status based on action
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error in decideConnection: ${error.message}`);
      }

      throw ExceptionFactory.internalServerError('Failed to process connection decision');
    }
  }

  /**
   * Get List of connection requests sent to a specific user.
   *
   * @param userId - The ID of the user to whom the connection requests are sent.
   * @returns A promise that resolves to an array of connection request objects.
   * Each object contains the requestId, username, and email of the user who sent the request.
   * @throws Will throw an error if the connection requests cannot be fetched.
   */
  async getConnectionRequestTo(userId: bigint): Promise<any[]> {
    const prisma = this.database.getPrisma();

    try {
      logger.info(`Fetching connection requests for userId: ${userId.toString()}`);

      // Fetch connection requests from the database
      const connectionRequests = await prisma.connectionRequest.findMany({
        where: {
          toId: userId,
        },
        select: {
          fromId: true,
          toId: true,
          fromUser: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          toUser: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      // Transform the result into the desired structure
      return connectionRequests.map((connectionRequest) => {
        return {
          // userId, ID of the user who requested the connection
          userId: connectionRequest.fromUser.id.toString(),
          // requestId, ID of the connection request
          requestId: connectionRequest.fromId.toString(),
          username: connectionRequest.fromUser.username,
          email: connectionRequest.fromUser.email,
        };
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error in getConnectionRequestTo: ${error.message}`);
        logger.error(`Stack Trace: ${error.stack}`);
      }

      throw ExceptionFactory.internalServerError('Failed to fetch connection requests');
    }
  }
}
