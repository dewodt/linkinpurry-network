import type { Prisma, PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { Config } from '@/core/config';
import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import type { IUpdateProfileRequestBodyDto } from '@/dto/user-dto';
import { Database } from '@/infrastructures/database/database';
import { ConnectionStatus } from '@/utils/enum';

import { type Optional } from './../types/common';
import type { IService } from './service';
import { UploadService } from './upload-service';

// todo: why this optional doesnt work
interface UserProfile {
  // level 1
  id: bigint;
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
        id: bigint;
        content: string;
        createdAt: Date;
      }[]
    | undefined;
}

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
    @inject(Config.Key) private readonly config: Config,
    @inject(Database.Key) private readonly database: Database,
    @inject(UploadService.Key) private readonly uploadService: UploadService
  ) {
    this.prisma = this.database.getPrisma();
  }

  /**
   * Get user profile by ID + connection state
   *
   * @param userId
   * @param currentUserId
   * @returns user profile
   * @throws ServiceException
   */
  async getProfile(currentUserId: bigint | undefined, userId: bigint) {
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

      // note: return the profile photo path with the full URL
      const fullURL =
        profile.profilePhotoPath.length > 0
          ? `${this.config.get('BE_URL')}${profile.profilePhotoPath}`
          : '';

      // Map to temporary result + access lavel
      const result: UserProfile = {
        // level 1
        id: profile.id,
        username: profile.username,
        fullName: profile.fullName || 'N/A',
        skills: profile.skills,
        workHistory: profile.workHistory,
        profilePhotoPath: fullURL,
        connectionCount: profile._count.sentConnections,
        connectionStatus: currentUserId
          ? profile._count.receivedConnections > 0
            ? ConnectionStatus.ACCEPTED
            : profile._count.receivedRequests > 0
              ? ConnectionStatus.PENDING
              : ConnectionStatus.NONE
          : ConnectionStatus.NONE,

        // Level 2
        feeds: isLevel2 ? profile.feeds : undefined,
      };

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
        profilePhotoPath = await this.uploadService.uploadFile('/avatar', body.profile_photo);
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

      // note: return the profile photo path with the full URL
      const fullURL =
        updatedData.profilePhotoPath.length > 0
          ? `${this.config.get('BE_URL')}${updatedData.profilePhotoPath}`
          : '';

      return {
        ...updatedData,
        profilePhotoPath: fullURL,
      };
    } catch (error) {
      // Internal server error
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to update user profile');
    }
  }
}
