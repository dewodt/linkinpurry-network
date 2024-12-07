import { type OpenAPIHono, createRoute } from '@hono/zod-openapi';
import type { create } from 'domain';
import { inject, injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import { InternalServerErrorException } from '@/core/exception';
import {
  type CursorPaginationResponseMeta,
  OpenApiResponseFactory,
  type PagePaginationResponseMeta,
  ResponseDtoFactory,
} from '@/dto/common';
import {
  type IGetFeedTimelineResponseBodyDto,
  type IGetMyFeedResponseBodyDto,
  getFeedTimelineRequestQueryDto,
  getFeedTimelineResponseBodyDto,
  getMyFeedRequestQueryDto,
  getMyFeedResponseBodyDto,
} from '@/dto/feed-dto';
import { AuthMiddleware } from '@/middlewares/auth-middleware';
import { FeedService } from '@/services/feed-service';

import type { IRoute } from './route';

@injectable()
export class FeedRoute implements IRoute {
  // Ioc Key
  public static readonly Key = 'FeedRoute';

  // Dependencies
  constructor(
    @inject(AuthMiddleware.Key) private authMiddleware: AuthMiddleware,
    @inject(FeedService.Key) private feedService: FeedService
  ) {}

  // Register
  registerRoutes(app: OpenAPIHono<IGlobalContext>): void {
    // Create post
    // Get feed timeline
    this.getFeedTimeline(app);

    // Get current user posts
    this.getMyFeeds(app);
    // Delete post
    // Update post
  }

  // Routes
  /**
   * Get feed timeline
   * @param app
   */
  private getFeedTimeline(app: OpenAPIHono<IGlobalContext>): void {
    // Create route definition
    const getFeedTimelineRoute = createRoute({
      tags: ['feed'],
      method: 'get',
      path: '/api/feed',
      summary: 'Get feed timeline',
      description: 'Get feed timeline',
      request: {
        query: getFeedTimelineRequestQueryDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessCursorPagination(
          'Feed timeline',
          getFeedTimelineResponseBodyDto
        ),
        401: OpenApiResponseFactory.jsonUnauthorized('Unauthorized'),
        500: OpenApiResponseFactory.jsonInternalServerError('Internal server error'),
      },
    });

    // Register route
    app.use(
      getFeedTimelineRoute.getRoutingPath(),
      this.authMiddleware.authorize({ isPublic: false })
    );
    app.openapi(getFeedTimelineRoute, async (c) => {
      // Get current user
      const currentUserId = c.get('user')!.id as bigint; // asssured by auth middleware

      // Get query
      const query = c.req.valid('query');

      try {
        // Get feed timeline
        const { feedTimeLine, meta } = await this.feedService.getFeedTimeline(
          currentUserId,
          query.cursor,
          query.limit
        );

        // Map to dto
        const responseData: IGetFeedTimelineResponseBodyDto = {
          cursor: meta.cursor ? meta.cursor.toString() : null,
          data: feedTimeLine.map((feed) => ({
            feed_id: feed.feedId.toString(),
            user_id: feed.userId.toString(),
            username: feed.username,
            full_name: feed.fullName,
            profile_photo_path: feed.profilePhotoPath,
            content: feed.content,
            created_at: feed.createdAt,
          })),
        };

        const metaDto: CursorPaginationResponseMeta = {
          cursor: meta.cursor ? meta.cursor.toString() : null,
          nextCursor: meta.nextCursor ? meta.nextCursor.toString() : null,
          limit: meta.limit,
        };

        const responseDto = ResponseDtoFactory.createDifferentSuccessCursorPaginationResponse(
          'Feed timeline',
          responseData,
          metaDto
        );

        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof InternalServerErrorException) return c.json(e.toResponseDto(), 500);

        // Internal server error
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }

  /**
   * Get current user feeds
   * @param app
   */
  private getMyFeeds(app: OpenAPIHono<IGlobalContext>): void {
    // Create route definition
    const getMyFeedsRoute = createRoute({
      tags: ['feed'],
      method: 'get',
      path: '/api/my-feed',
      summary: 'Get current user feeds',
      description: 'Get current user feeds',
      request: {
        query: getMyFeedRequestQueryDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessPagePagination(
          'Current user feeds',
          getMyFeedResponseBodyDto
        ),
        401: OpenApiResponseFactory.jsonUnauthorized('Unauthorized'),
        500: OpenApiResponseFactory.jsonInternalServerError('Internal server error'),
      },
    });

    // Register route
    app.use(getMyFeedsRoute.getRoutingPath(), this.authMiddleware.authorize({ isPublic: false }));
    app.openapi(getMyFeedsRoute, async (c) => {
      // Get current user
      const currentUserId = c.get('user')!.id as bigint; // asssured by auth middleware

      // Get query
      const query = c.req.valid('query');

      try {
        // Get current user feeds
        const { feeds, meta } = await this.feedService.getMyFeeds(
          currentUserId,
          query.page,
          query.limit
        );

        // Map to dto
        const responseData: IGetMyFeedResponseBodyDto = feeds.map((feed) => ({
          feed_id: feed.id.toString(),
          content: feed.content,
          created_at: feed.createdAt.toISOString(),
        }));

        const metaDto: PagePaginationResponseMeta = {
          page: meta.page,
          limit: meta.limit,
          totalItems: meta.totalItems,
          totalPages: meta.totalPages,
        };

        const responseDto = ResponseDtoFactory.createSuccessPagePaginationResponseDto(
          'Current user feeds',
          responseData,
          metaDto
        );

        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof InternalServerErrorException) return c.json(e.toResponseDto(), 500);

        // Internal server error
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }
}
