import { type OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { inject, injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/core/exception';
import {
  type CursorPaginationResponseMeta,
  OpenApiRequestFactory,
  OpenApiResponseFactory,
  type PagePaginationResponseMeta,
  ResponseDtoFactory,
} from '@/dto/common';
import {
  type IGetFeedDetailResponseBodyDto,
  type IGetFeedTimelineResponseBodyDto,
  type IGetMyFeedResponseBodyDto,
  createFeedRequestBodyDto,
  deleteFeedRequestParamsDto,
  getFeedDetailRequestParamsDto,
  getFeedDetailResponseBodyDto,
  getFeedTimelineRequestQueryDto,
  getFeedTimelineResponseBodyDto,
  getMyFeedRequestQueryDto,
  getMyFeedResponseBodyDto,
  updateFeedRequestBodyDto,
  updateFeedRequestParamsDto,
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
    this.createFeed(app);

    // Get feed timeline
    this.getFeedTimeline(app);

    // Get feed detail
    this.getFeedDetail(app);

    // Get current user posts
    this.getMyFeeds(app);

    // Update post
    this.updateFeed(app);

    // Delete post
    this.deleteFeed(app);
  }

  // Routes

  /**
   * Create feed
   *
   * @param app
   */
  private createFeed(app: OpenAPIHono<IGlobalContext>): void {
    // Create route definition
    const createFeedRoute = createRoute({
      tags: ['feed'],
      method: 'post',
      path: '/api/feed',
      summary: 'Create feed',
      description: 'Create feed',
      request: {
        body: OpenApiRequestFactory.jsonBody('Create feed request body', createFeedRequestBodyDto),
      },
      responses: {
        201: OpenApiResponseFactory.jsonSuccess('Feed created successfully'),
        401: OpenApiResponseFactory.jsonUnauthorized('Unauthorized'),
        500: OpenApiResponseFactory.jsonInternalServerError('Internal server error'),
      },
    });

    // Register route
    app.use(createFeedRoute.getRoutingPath(), this.authMiddleware.authorize({ isPublic: false }));
    app.openapi(createFeedRoute, async (c) => {
      // Get current user
      const currentUser = c.get('user')!; // assured by auth middleware

      // Get request body
      const requestBody = c.req.valid('json');

      try {
        // Create feed
        await this.feedService.createFeed(currentUser.userId, requestBody.content);

        // Map to dto
        const responseDto = ResponseDtoFactory.createSuccessResponseDto(
          'Feed created successfully'
        );

        return c.json(responseDto, 201);
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
      const currentUser = c.get('user')!; // assured by auth middleware

      // Get query
      const query = c.req.valid('query');

      try {
        // Get feed timeline
        const { feeds, meta } = await this.feedService.getFeedTimeline(
          currentUser.userId,
          query.cursor,
          query.limit
        );

        // Map to dto
        const responseData: IGetFeedTimelineResponseBodyDto = {
          cursor: meta.cursor ? meta.cursor.toString() : null,
          data: feeds.map((feed) => ({
            feed_id: feed.feedId.toString(),
            user_id: feed.userId.toString(),
            username: feed.username,
            full_name: feed.fullName,
            profile_photo: feed.profilePhotoPath,
            content: feed.content,
            created_at: feed.createdAt,
            updated_at: feed.updatedAt,
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
   * Get feed detail page
   *
   * @param app
   */
  private getFeedDetail(app: OpenAPIHono<IGlobalContext>): void {
    // Create route definition
    const getFeedDetailRoute = createRoute({
      tags: ['feed'],
      method: 'get',
      path: '/api/feed/{feedId}',
      summary: 'Get feed detail',
      description: 'Get feed detail',
      request: {
        params: getFeedDetailRequestParamsDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData('Feed detail', getFeedDetailResponseBodyDto),
        401: OpenApiResponseFactory.jsonUnauthorized('Unauthorized'),
        404: OpenApiResponseFactory.jsonNotFound('Feed not found'),
        500: OpenApiResponseFactory.jsonInternalServerError('Internal server error'),
      },
    });

    // Register route
    app.use(
      getFeedDetailRoute.getRoutingPath(),
      this.authMiddleware.authorize({ isPublic: false })
    );
    app.openapi(getFeedDetailRoute, async (c) => {
      // Get request params
      const params = c.req.valid('param');

      try {
        // Get feed detail
        const feed = await this.feedService.getFeedDetail(params.feedId);

        // Map to dto
        const responseData: IGetFeedDetailResponseBodyDto = {
          feed_id: feed.feedId.toString(),
          user_id: feed.userId.toString(),
          username: feed.username,
          full_name: feed.fullName,
          profile_photo: feed.profilePhotoPath,
          content: feed.content,
          created_at: feed.createdAt.toISOString(),
          updated_at: feed.updatedAt.toISOString(),
        };
        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Feed detail',
          responseData
        );
        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof NotFoundException) return c.json(e.toResponseDto(), 404);
        else if (e instanceof InternalServerErrorException) return c.json(e.toResponseDto(), 500);

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
        200: OpenApiResponseFactory.jsonSuccessCursorPagination(
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
      const currentUser = c.get('user')!; // assured by auth middleware

      // Get query
      const query = c.req.valid('query');

      try {
        // Get current user feeds
        const { myFeeds, meta } = await this.feedService.getMyFeeds(
          currentUser.userId,
          query.cursor,
          query.limit
        );

        // Map to dto
        const responseData: IGetMyFeedResponseBodyDto = myFeeds.map((feed) => ({
          feed_id: feed.feedId.toString(),
          user_id: feed.userId.toString(),
          content: feed.content,
          created_at: feed.createdAt.toISOString(),
          updated_at: feed.updatedAt.toISOString(),
        }));

        const metaDto: CursorPaginationResponseMeta = {
          cursor: meta.cursor ? meta.cursor.toString() : null,
          nextCursor: meta.nextCursor ? meta.nextCursor.toString() : null,
          limit: meta.limit,
        };

        const responseDto = ResponseDtoFactory.createSuccessCursorPaginationResponseDto(
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

  /**
   * Update feed
   */
  private updateFeed(app: OpenAPIHono<IGlobalContext>): void {
    // Create route definition
    const updateFeedRoute = createRoute({
      tags: ['feed'],
      method: 'put',
      path: '/api/feed/{feedId}',
      summary: 'Update feed',
      description: 'Update feed',
      request: {
        params: updateFeedRequestParamsDto,
        body: OpenApiRequestFactory.jsonBody('Update feed request body', updateFeedRequestBodyDto),
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccess('Feed updated successfully'),
        400: OpenApiResponseFactory.jsonBadRequest('Validation error'),
        401: OpenApiResponseFactory.jsonUnauthorized('Unauthorized'),
        403: OpenApiResponseFactory.jsonForbidden('Trying to update other user feed'),
        404: OpenApiResponseFactory.jsonNotFound('Feed not found'),
        500: OpenApiResponseFactory.jsonInternalServerError('Internal server error'),
      },
    });

    // Register route
    app.use(updateFeedRoute.getRoutingPath(), this.authMiddleware.authorize({ isPublic: false }));
    app.openapi(updateFeedRoute, async (c) => {
      // Get current user
      const currentUser = c.get('user')!; // assured by auth middleware

      // Get request params
      const params = c.req.valid('param');

      // Get request body
      const requestBody = c.req.valid('json');

      try {
        // Update feed
        await this.feedService.updateFeed(currentUser.userId, params.feedId, requestBody.content);

        // Map to dto
        const responseDto = ResponseDtoFactory.createSuccessResponseDto(
          'Feed updated successfully'
        );

        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof NotFoundException) return c.json(e.toResponseDto(), 404);
        else if (e instanceof ForbiddenException) return c.json(e.toResponseDto(), 403);
        else if (e instanceof InternalServerErrorException) return c.json(e.toResponseDto(), 500);

        // Internal server error
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }

  /**
   * Delete feed
   */
  private deleteFeed(app: OpenAPIHono<IGlobalContext>): void {
    // Create route definition
    const deleteFeedRoute = createRoute({
      tags: ['feed'],
      method: 'delete',
      path: '/api/feed/{feedId}',
      summary: 'Delete feed',
      description: 'Delete feed',
      request: {
        params: deleteFeedRequestParamsDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccess('Feed deleted successfully'),
        401: OpenApiResponseFactory.jsonUnauthorized('Unauthorized'),
        403: OpenApiResponseFactory.jsonForbidden('Trying to delete other user feed'),
        404: OpenApiResponseFactory.jsonNotFound('Feed not found'),
        500: OpenApiResponseFactory.jsonInternalServerError('Internal server error'),
      },
    });

    // Register route
    app.use(deleteFeedRoute.getRoutingPath(), this.authMiddleware.authorize({ isPublic: false }));
    app.openapi(deleteFeedRoute, async (c) => {
      // Get current user
      const currentUser = c.get('user')!; // assured by auth middleware

      // Get request params
      const params = c.req.valid('param');

      try {
        // Delete feed
        await this.feedService.deleteFeed(currentUser.userId, params.feedId);

        // Map to dto
        const responseDto = ResponseDtoFactory.createSuccessResponseDto(
          'Feed deleted successfully'
        );

        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof NotFoundException) return c.json(e.toResponseDto(), 404);
        else if (e instanceof ForbiddenException) return c.json(e.toResponseDto(), 403);
        else if (e instanceof InternalServerErrorException) return c.json(e.toResponseDto(), 500);

        // Internal server error
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }
}
