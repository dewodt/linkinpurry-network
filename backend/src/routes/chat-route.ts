import { type OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { inject, injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import { BadRequestException, InternalServerErrorException } from '@/core/exception';
import {
  type IGetChatHistoryResponseBodyDto,
  type IGetChatInboxResponseBodyDto,
  getChatHistoryRequestParamsDto,
  getChatHistoryRequestQueryDto,
  getChatHistoryResponseBodyDto,
  getChatInboxRequestQueryDto,
  getChatInboxResponseBodyDto,
} from '@/dto/chat-dto';
import {
  type CursorPaginationResponseMeta,
  OpenApiResponseFactory,
  ResponseDtoFactory,
} from '@/dto/common';
import { AuthMiddleware } from '@/middlewares/auth-middleware';
import { ChatService } from '@/services/chat-service';

import type { IRoute } from './route';

@injectable()
export class ChatRoute implements IRoute {
  // IoC key
  static readonly Key = Symbol.for('ChatRoute');

  // Dependencies
  constructor(
    @inject(AuthMiddleware.Key) private authMiddleware: AuthMiddleware,
    @inject(ChatService.Key) private chatService: ChatService
  ) {}

  /**
   * Register route handlers
   */
  registerRoutes(app: OpenAPIHono<IGlobalContext>): void {
    // Get chat inbox
    this.getChatInbox(app);

    // Get chat history
    this.getChatHistory(app);
  }

  /**
   * Get chat inbox
   */
  private getChatInbox(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const getChatInboxRoute = createRoute({
      tags: ['chat'],
      method: 'get',
      path: '/api/chat/inbox',
      summary: 'Get chat inbox',
      description: 'API endpoint for getting chat inbox',
      request: {
        query: getChatInboxRequestQueryDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessCursorPagination(
          'Get chat inbox successful',
          getChatInboxResponseBodyDto
        ),
        400: OpenApiResponseFactory.jsonBadRequest('cursor must be type of string (bigint)'),
        401: OpenApiResponseFactory.jsonUnauthorized('Unauthorized'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while getting chat inbox'
        ),
      },
    });

    // Register route
    app.use(getChatInboxRoute.getRoutingPath(), this.authMiddleware.authorize({ isPublic: false }));
    app.openapi(getChatInboxRoute, async (c) => {
      // Get validated query
      const { search, cursor, limit } = c.req.valid('query');

      // Get current user id
      const currentUserId = c.get('user')!.userId; // assured by auth middleware

      // Call service
      try {
        const { inboxes, meta } = await this.chatService.getChatInbox(
          currentUserId,
          search,
          cursor,
          limit
        );

        // Map response to dto
        const responseData: IGetChatInboxResponseBodyDto = inboxes.map((inbox) => {
          return {
            other_user_id: inbox.other_user_id.toString(),
            other_user_username: inbox.other_user_username,
            other_user_full_name: inbox.other_user_full_name,
            other_user_profile_photo_path: inbox.other_user_profile_photo_path,
            latest_message_id: inbox.latest_message_id.toString(),
            latest_message_timestamp: inbox.latest_message_timestamp.toISOString(),
            latest_message: inbox.latest_message,
          };
        });

        const metaDto: CursorPaginationResponseMeta = {
          cursor: cursor ? cursor.toString() : null,
          nextCursor: meta.nextCursor ? meta.nextCursor.toString() : null,
          limit,
        };

        const responseDto = ResponseDtoFactory.createSuccessCursorPaginationResponseDto(
          'Get chat inbox successful',
          responseData,
          metaDto
        );

        return c.json(responseDto, 200);
      } catch (e) {
        // Internal server error
        if (e instanceof InternalServerErrorException) return c.json(e.toResponseDto(), 500);

        // Unexpected error
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }

  /**
   * Get chat history
   */
  private getChatHistory(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const getChatHistoryRoute = createRoute({
      tags: ['chat'],
      method: 'get',
      path: '/api/chat/{otherUserId}/history',
      summary: 'Get chat history',
      description: 'API endpoint for getting chat history',
      request: {
        params: getChatHistoryRequestParamsDto,
        query: getChatHistoryRequestQueryDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessCursorPagination(
          'Get chat history successful',
          getChatHistoryResponseBodyDto
        ),
        400: OpenApiResponseFactory.jsonBadRequest(
          'Invalid cursor type (bigint in string) | Trying to get chat history of yourself | you are not connected to other user'
        ),
        401: OpenApiResponseFactory.jsonUnauthorized('Unauthorized'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while getting chat history'
        ),
      },
    });

    // Register route
    app.use(
      getChatHistoryRoute.getRoutingPath(),
      this.authMiddleware.authorize({ isPublic: false })
    );
    app.openapi(getChatHistoryRoute, async (c) => {
      // Get validated params
      const { otherUserId } = c.req.valid('param');

      // Get validated query
      const { cursor, limit } = c.req.valid('query');

      // Get current user id
      const currentUserId = c.get('user')!.userId; // assured by auth middleware

      // Call service
      try {
        const { history, meta } = await this.chatService.getChatHistory(
          currentUserId,
          otherUserId,
          cursor,
          limit
        );

        // Map response to dto
        const responseData: IGetChatHistoryResponseBodyDto = history.map((chat) => {
          return {
            chat_id: chat.id.toString(),
            from_user_id: chat.fromId.toString(),
            timestamp: chat.timestamp.toISOString(),
            message: chat.message,
          };
        });

        const metaDto: CursorPaginationResponseMeta = {
          cursor: cursor ? cursor.toString() : null,
          nextCursor: meta.nextCursor ? meta.nextCursor.toString() : null,
          limit,
        };

        const responseDto = ResponseDtoFactory.createSuccessCursorPaginationResponseDto(
          'Get chat history successful',
          responseData,
          metaDto
        );

        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof BadRequestException) return c.json(e.toResponseDto(), 400);
        else if (e instanceof InternalServerErrorException) return c.json(e.toResponseDto(), 500);

        // Other errors
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }
}
