import type { Prisma, PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { Config } from '@/core/config';
import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import type { IUpdateProfileRequestBodyDto } from '@/dto/user-dto';
import { Database } from '@/infrastructures/database/database';

import type { IService } from './service';
import { UploadService } from './upload-service';

type UserProfile = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    fullName: true;
    profilePhotoPath: true;
    _count: {
      select: {
        sentConnections: true;
      };
    };
    workHistory: true;
    skills: true;
    feeds: {
      select: {
        id: true;
        content: true;
        createdAt: true;
        updatedAt: true;
        userId: true;
      };
    };
  };
}>;

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
  getProfile(
    currentUserId: bigint | undefined,
    userId: bigint
  ): Promise<{ profile: UserProfile; isConnected: boolean }>;
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

    // Determine connection state
    // actually should be done in 1 query, but really hard to achieve when using ORMs :D
    let isConnected = false;
    if (currentUserId) {
      try {
        const connection = await this.prisma.connection.findFirst({
          where: {
            OR: [
              {
                fromId: userId,
                toId: currentUserId,
              },
              {
                fromId: currentUserId,
                toId: userId,
              },
            ],
          },
        });

        if (connection) isConnected = true;
      } catch (error) {
        // Internal server error
        if (error instanceof Error) logger.error(error.message);

        throw ExceptionFactory.internalServerError('Failed to infer connection state');
      }
    }

    // Level
    const isLevel1 = true;
    const isLevel2 = isLevel1 && currentUserId !== undefined && !isConnected;
    const isLevel3 = isLevel1 && currentUserId !== undefined && isConnected;
    const isLevel4 = isLevel1 && currentUserId !== undefined && currentUserId === userId;

    try {
      const profile = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          // Level 1 or higher
          id: true,
          username: true,
          fullName: true,
          profilePhotoPath: true,
          _count: {
            select: {
              sentConnections: true,
            },
          },

          // Level 2 or higher
          workHistory: isLevel2 || isLevel3 || isLevel4,

          // Level 3 or higher
          skills: isLevel3 || isLevel4,
          feeds: (isLevel3 || isLevel4) && {
            select: {
              id: true,
              content: true,
              createdAt: true,
            },
            take: 5,
            orderBy: {
              createdAt: 'desc',
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

      return {
        isConnected,
        profile: {
          ...profile,
          profilePhotoPath: fullURL,
        },
      };
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
          workHistory: body.work_history,
          skills: body.skills,
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
