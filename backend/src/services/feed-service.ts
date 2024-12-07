import type { Prisma, PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { Config } from '@/core/config';
import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import { Database } from '@/infrastructures/database/database';

import { NotificationService } from './notification-service';
import type { IService } from './service';

@injectable()
export class FeedService implements IService {
  // IoC Key
  static readonly Key = Symbol.for('FeedService');

  private prisma: PrismaClient;

  // Dependencies
  constructor(
    @inject(Config.Key) private readonly config: Config,
    @inject(Database.Key) private readonly database: Database,
    @inject(NotificationService.Key) private readonly notificationService: NotificationService
  ) {
    this.prisma = this.database.getPrisma();
  }

  /**
   * Create post
   */
  async createFeed(currentUserId: bigint, content: string) {
    try {
      // Create feed
      const feed = await this.prisma.feed.create({
        data: {
          userId: currentUserId,
          content,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      // Send notification to current user's connections (without awaiting)
      this.notificationService
        .sendNotificationToUserConnections(currentUserId, {
          title: `New Post From ${feed.user.username} | LinkinPurry`,
          message: "You've got a new post from your connection",
          url: `${this.config.get('FE_URL')}/feed/${feed.id}`,
        })
        .catch((error) => {
          if (error instanceof Error) logger.error(error.message);
        });

      return {
        feedId: feed.id,
        userId: feed.userId,
        content: feed.content,
        createdAt: feed.createdAt,
        updatedAt: feed.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to create feed');
    }
  }

  /**
   * Get feed timeline
   * Get the current user posts and its networks posts sorted by post created_at and also cursor paginated
   */
  async getFeedTimeline(currentUserId: bigint, cursor: bigint | undefined, limit: number) {
    try {
      // Get current user timeline
      const currentUserFeedTimeline = await this.prisma.feed.findMany({
        where: {
          OR: [
            // current user
            {
              userId: currentUserId,
            },
            // current user's network
            {
              user: {
                // connection is mutual A=>B, B=>A but
                // use receivedConnection as a filter, (fromId = currentUserId)
                receivedConnections: {
                  some: {
                    fromId: currentUserId,
                  },
                },
              },
            },
          ],
        },
        // the poster data
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePhotoPath: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
        // cursor pagination
        cursor: cursor ? { id: cursor } : undefined,
        take: limit + 1,
      });

      let nextCursor: bigint | undefined;
      if (currentUserFeedTimeline.length > limit) {
        const nextFeed = currentUserFeedTimeline.pop();
        if (nextFeed) nextCursor = nextFeed.id;
      }

      const feedTimeLine = currentUserFeedTimeline.map((feed) => ({
        feedId: feed.id,
        userId: feed.userId,
        username: feed.user.username,
        fullName: feed.user.fullName || 'N/A',
        profilePhotoPath: feed.user.profilePhotoPath,
        content: feed.content,
        createdAt: feed.createdAt,
        updatedAt: feed.updatedAt,
      }));

      const meta = {
        cursor,
        nextCursor,
        limit,
      };

      return {
        feedTimeLine,
        meta,
      };
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to get feed timeline');
    }
  }

  /**
   * Get current user feeds
   */
  async getMyFeeds(currentUserId: bigint, cursor: bigint | undefined, limit: number) {
    try {
      // Get feeds
      const feeds = await this.prisma.feed.findMany({
        where: {
          userId: currentUserId,
        },
        orderBy: {
          id: 'desc',
        },
        cursor: cursor ? { id: cursor } : undefined,
        take: limit + 1,
      });

      // Check if there is next page
      let nextCursor: bigint | undefined;
      if (feeds.length > limit) {
        const nextFeed = feeds.pop();
        if (nextFeed) nextCursor = nextFeed.id;
      }

      const myFeeds = feeds.map((feed) => ({
        feedId: feed.id,
        userId: feed.userId,
        content: feed.content,
        createdAt: feed.createdAt,
        updatedAt: feed.updatedAt,
      }));

      const meta = {
        cursor,
        nextCursor,
        limit,
      };

      return {
        myFeeds,
        meta,
      };
    } catch (e) {
      if (e instanceof Error) logger.error(e.message);

      throw ExceptionFactory.internalServerError('Failed to get current user feeds');
    }
  }

  /**
   * Get feed detail
   */
  async getFeedDetail(feedId: bigint) {
    // Validate if feed exists
    let feed: Prisma.FeedGetPayload<{
      select: {
        id: true;
        userId: true;
        content: true;
        createdAt: true;
        updatedAt: true;
        user: {
          select: {
            id: true;
            username: true;
            fullName: true;
            profilePhotoPath: true;
          };
        };
      };
    }> | null;

    try {
      feed = await this.prisma.feed.findUnique({
        where: {
          id: feedId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePhotoPath: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to get feed detail');
    }

    // Feed not found
    if (!feed) throw ExceptionFactory.notFound('Feed not found');

    return {
      feedId: feed.id,
      userId: feed.userId,
      username: feed.user.username,
      fullName: feed.user.fullName || 'N/A',
      profilePhotoPath: feed.user.profilePhotoPath,
      content: feed.content,
      createdAt: feed.createdAt,
      updatedAt: feed.updatedAt,
    };
  }

  /**
   * Update post
   */
  async updateFeed(currentUserId: bigint, feedId: bigint, content: string) {
    // Validate if feed exists
    let feed: Prisma.FeedGetPayload<{}> | null;

    try {
      feed = await this.prisma.feed.findUnique({
        where: {
          id: feedId,
        },
      });
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to update feed');
    }

    // Feed not found
    if (!feed) throw ExceptionFactory.notFound('Feed not found');

    // Validate if current user is the owner of the feed
    if (feed.userId !== currentUserId)
      throw ExceptionFactory.forbidden('You can only update your own feed');

    // Update feed
    try {
      const updatedFeed = await this.prisma.feed.update({
        where: {
          id: feedId,
        },
        data: {
          content,
        },
      });

      return updatedFeed;
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to update feed');
    }
  }

  /**
   * Delete post
   */
  async deleteFeed(currentUserId: bigint, feedId: bigint) {
    // Validate if feed exists
    let feed: Prisma.FeedGetPayload<{}> | null;

    try {
      feed = await this.prisma.feed.findUnique({
        where: {
          id: feedId,
        },
      });
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to delete feed');
    }

    // Feed not found
    if (!feed) throw ExceptionFactory.notFound('Feed not found');

    // Validate if current user is the owner of the feed
    if (feed.userId !== currentUserId)
      throw ExceptionFactory.forbidden('You can only delete your own feed');

    // Delete feed
    try {
      await this.prisma.feed.delete({
        where: {
          id: feedId,
        },
      });
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to delete feed');
    }
  }
}