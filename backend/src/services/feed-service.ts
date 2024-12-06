import type { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import type { CursorPaginationResponseMeta } from '@/dto/common';
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

  /**
   * Create post
   */

  /**
   * Update post
   */

  /**
   * Delete post
   */
}
