import type { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import { Database } from '@/infrastructures/database/database';

@injectable()
export class FeedService {
  // IoC Key
  static readonly Key = Symbol.for('FeedService');

  private prisma: PrismaClient;

  // Dependencies
  constructor(@inject(Database.Key) private readonly database: Database) {
    this.prisma = this.database.getPrisma();
  }

  /**
   * Create post
   */
  async createFeed(currentUserId: bigint, content: string) {
    try {
      const feed = await this.prisma.feed.create({
        data: {
          userId: currentUserId,
          content,
        },
      });

      return {
        feedId: feed.id,
        userId: feed.userId,
        content: feed.content,
        createdAt: feed.createdAt.toISOString(),
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
        createdAt: feed.createdAt.toISOString(),
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
  async getMyFeeds(currentUserId: bigint, page: number, limit: number) {
    try {
      // Get total items
      const totalItems = await this.prisma.feed.count({
        where: {
          userId: currentUserId,
        },
      });

      if (totalItems === 0) return { feeds: [], meta: { totalItems, totalPages: 0, page, limit } };

      // Validate upper bound of page
      const totalPages = Math.ceil(totalItems / limit);
      if (page > totalPages) page = totalPages;

      // Get feeds
      const feeds = await this.prisma.feed.findMany({
        where: {
          userId: currentUserId,
        },
        orderBy: {
          id: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        feeds,
        meta: {
          totalItems,
          totalPages,
          page,
          limit,
        },
      };
    } catch (e) {
      if (e instanceof Error) logger.error(e.message);

      throw ExceptionFactory.internalServerError('Failed to get current user feeds');
    }
  }

  /**
   * Update post
   */

  /**
   * Delete post
   */
}
