import type { Prisma, PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { Bucket } from '@/core/bucket';
import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import type { PagePaginationResponseMeta } from '@/dto/common';
import type { IUpdateProfileRequestBodyDto } from '@/dto/user-dto';
import { Database } from '@/infrastructures/database/database';
import { RedisClient } from '@/infrastructures/redis/redis';
import { ConnectionStatus } from '@/utils/enum';

import type { IService } from './service';

interface UserProfile {
  // level 1
  id: string;
  username: string;
  fullName: string;
  profilePhotoPath: string;
  connectionCount: number;
  workHistory: string | null;
  skills: string | null;
  connectionStatus: ConnectionStatus;

  // level 2
  feeds?:
    | {
        id: string;
        content: string;
        createdAt: Date;
      }[]
    | undefined;
}

type UserPreview = Omit<UserProfile, 'feeds' | 'workHistory' | 'skills' | 'connectionCount'>;

type UpdateProfile = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    fullName: true;
    profilePhotoPath: true;
    workHistory: true;
    skills: true;
  };
}>;

export interface IUserService extends IService {
  getUsers(
    currentUserId: bigint | undefined,
    search: string | undefined,
    page: number,
    limit: number
  ): Promise<{
    users: UserPreview[];
    meta: PagePaginationResponseMeta;
  }>;

  getProfile(currentUserId: bigint | undefined, userId: bigint): Promise<UserProfile>;

  updateProfile(
    currentUserId: bigint,
    userId: bigint,
    body: IUpdateProfileRequestBodyDto
  ): Promise<UpdateProfile>;
}

@injectable()
export class UserService implements IUserService {
  // IoC Key
  static readonly Key: symbol = Symbol.for('UserService');

  private prisma: PrismaClient;

  // Dependencies
  constructor(
    @inject(Database.Key) private readonly database: Database,
    @inject(RedisClient.Key) private readonly redis: RedisClient,
    @inject(Bucket.Key) private readonly bucket: Bucket
  ) {
    this.prisma = this.database.getPrisma();
  }

  /**
   * Get users
   * retunrrs the list of all users in the system. If authenticated, dont return current user. search is based on name and username (case insensitive) % %
   */
  async getUsers(
    currentUserId: bigint | undefined,
    search: string | undefined,
    page: number,
    limit: number
  ) {
    try {
      const totalItems = await this.prisma.user.count({
        where: {
          AND: [
            {
              id: currentUserId
                ? {
                    not: currentUserId,
                  }
                : undefined,
            },
            {
              OR: [
                {
                  username: search
                    ? {
                        contains: search,
                        mode: 'insensitive',
                      }
                    : undefined,
                },
                {
                  fullName: search
                    ? {
                        contains: search,
                        mode: 'insensitive',
                      }
                    : undefined,
                },
              ],
            },
          ],
        },
      });

      // Empty, early return
      if (totalItems === 0) return { users: [], meta: { page, limit, totalItems, totalPages: 0 } };

      // Validate upper bound of page
      const totalPages = Math.ceil(totalItems / limit);
      if (page > totalPages) page = totalPages;

      // Get users
      const rawUsers = await this.prisma.user.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: [
          {
            fullName: 'asc',
          },
          {
            username: 'asc',
          },
        ],
        where: {
          AND: [
            {
              id: currentUserId
                ? {
                    not: currentUserId,
                  }
                : undefined,
            },
            {
              OR: [
                {
                  username: search
                    ? {
                        contains: search,
                        mode: 'insensitive',
                      }
                    : undefined,
                },
                {
                  fullName: search
                    ? {
                        contains: search,
                        mode: 'insensitive',
                      }
                    : undefined,
                },
              ],
            },
          ],
        },
        include: {
          _count: currentUserId
            ? {
                select: {
                  // for connection status (only when authenticated)
                  // pending or no
                  receivedRequests: {
                    where: {
                      fromId: currentUserId,
                    },
                  },
                  // connected or no
                  receivedConnections: {
                    where: {
                      fromId: currentUserId,
                    },
                  },
                },
              }
            : undefined,
        },
      });

      const users: UserPreview[] = rawUsers.map((user) => {
        return {
          id: user.id.toString(),
          username: user.username,
          fullName: user.fullName || 'N/A',
          profilePhotoPath: user.profilePhotoPath,
          connectionStatus: currentUserId
            ? user._count.receivedConnections > 0
              ? ConnectionStatus.ACCEPTED
              : user._count.receivedRequests > 0
                ? ConnectionStatus.PENDING
                : ConnectionStatus.NONE
            : ConnectionStatus.NONE,
        };
      });

      const meta: PagePaginationResponseMeta = {
        page,
        limit,
        totalItems,
        totalPages,
      };

      return { users, meta };
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to get users');
    }
  }

  /**
   * Get user profile by ID + connection state
   * Cache dependency:
   * - current user edit profile (done)
   * - current user create new post, delete post, update post (done)
   * - current user accept connection, delete connection, connect to a pending req to this user
   * - anyone accept to this user or connect to this user with a pending req (done)
   * result is different for each user because of the connectionStatusField, so we need to cache it per user
   *
   * @param userId
   * @param currentUserId
   * @returns user profile
   * @throws ServiceException
   */
  async getProfile(currentUserId: bigint | undefined, userId: bigint) {
    // Caching Layer
    // id 0 -> public user
    // id else -> authenticated user
    const cacheKey = `user-profile:${userId}:${currentUserId || 0}`;

    const result = await this.redis.getJson<UserProfile>(cacheKey);
    if (result) {
      logger.info(`Cache hit: ${cacheKey}`);
      return result;
    }

    // Database Layer
    // Simple check if user exists
    let isUserExists = false;
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      });

      if (user) isUserExists = true;
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to get user profile');
    }

    // User not found
    if (!isUserExists) throw ExceptionFactory.notFound('User not found');

    // Access level
    // const isLevel1 = true; // all public
    const isLevel2 = currentUserId !== undefined; // authenticated

    try {
      const profile = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          feeds: isLevel2
            ? {
                select: {
                  id: true,
                  content: true,
                  createdAt: true,
                },
                take: 5,
                orderBy: {
                  createdAt: 'desc',
                },
              }
            : false,
          _count: {
            select: {
              // for connection count
              sentConnections: true,

              // for connection status (only when authenticated)
              // pending or no
              receivedRequests: currentUserId
                ? {
                    where: {
                      fromId: currentUserId,
                    },
                  }
                : false,

              // connected or no
              receivedConnections: currentUserId
                ? {
                    where: {
                      fromId: currentUserId,
                    },
                  }
                : false,
            },
          },
        },
      });

      if (!profile) throw ExceptionFactory.notFound('User not found');

      // Map to temporary result + access lavel
      const result: UserProfile = {
        // level 1
        id: profile.id.toString(),
        username: profile.username,
        fullName: profile.fullName || 'N/A',
        skills: profile.skills,
        workHistory: profile.workHistory,
        profilePhotoPath: profile.profilePhotoPath,
        connectionCount: profile._count.sentConnections,
        connectionStatus: currentUserId
          ? profile._count.receivedConnections > 0
            ? ConnectionStatus.ACCEPTED
            : profile._count.receivedRequests > 0
              ? ConnectionStatus.PENDING
              : ConnectionStatus.NONE
          : ConnectionStatus.NONE,

        // Level 2
        feeds: isLevel2
          ? profile.feeds.map((feed) => ({ ...feed, id: feed.id.toString() }))
          : undefined,
      };

      // Cache the result into redis (set TTL to 1 hour)
      // id 0 -> public user
      // id else -> authenticated user
      await this.redis.setJson(cacheKey, result, 3600);
      logger.info(`Cache miss: ${cacheKey}`);

      return result;
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to get user profile');
    }
  }

  /**
   * Update current user profile
   *
   * @param currentUserId
   * @returns void
   * @throws ServiceException
   */
  async updateProfile(currentUserId: bigint, userId: bigint, body: IUpdateProfileRequestBodyDto) {
    // I.S. currentUserId exists because passed authentication
    if (currentUserId !== userId)
      throw ExceptionFactory.forbidden('You can only update your own profile');

    // Check if username exists
    let usernameExists = false;
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          username: body.username,
          NOT: {
            id: currentUserId,
          },
        },
        select: {
          id: true,
        },
      });

      if (user) usernameExists = true;
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to update user profile');
    }

    if (usernameExists)
      throw ExceptionFactory.badRequest('Username already exists', [
        { field: 'username', message: 'Username already exists' },
      ]);

    // Upload file
    let profilePhotoPath: string | null = null;
    if (body.profile_photo) {
      try {
        profilePhotoPath = await this.bucket.uploadFile('/avatar', body.profile_photo);
      } catch (error) {
        // Internal server error
        if (error instanceof Error) logger.error(error.message);

        throw ExceptionFactory.internalServerError('Failed to update user profile');
      }
    }

    // Update user
    try {
      const updatedData = await this.prisma.user.update({
        where: {
          id: currentUserId,
        },
        data: {
          username: body.username,
          fullName: body.name,
          workHistory: body.work_history || null,
          skills: body.skills || null,
          profilePhotoPath: profilePhotoPath || undefined,
        },
      });

      // Clear cache
      const cachePrefix = `user-profile:${currentUserId}`;
      const deletedCount = await this.redis.deleteWithPrefix(cachePrefix);
      if (deletedCount > 0) logger.info(`Cache invalidated (prefix): ${cachePrefix}*`);

      return updatedData;
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to update user profile');
    }
  }
}
