import { type OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { inject, injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import { InternalServerErrorException } from '@/core/exception';
import { OpenApiRequestFactory, OpenApiResponseFactory, ResponseDtoFactory } from '@/dto/common';
import { zodPushSubscriptionDto } from '@/dto/notification';
import { AuthMiddleware } from '@/middlewares/auth-middleware';
import { NotificationService } from '@/services/notification';

import type { IRoute } from './route';

@injectable()
export class NotificationRoute implements IRoute {
  // IoC key
  static readonly Key = Symbol.for('NotificationRoute');

  // Dependencies
  constructor(
    @inject(AuthMiddleware.Key) private readonly authMiddleware: AuthMiddleware,
    @inject(NotificationService.Key) private readonly notificationService: NotificationService
  ) {}

  registerRoutes(app: OpenAPIHono<IGlobalContext>): void {
    // Subscribe notification
    this.subscribeNotification(app);
  }

  /**
   * Subscribe to notification
   */
  private subscribeNotification(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const subscribeNotificationRoute = createRoute({
      tags: ['notification'],
      method: 'post',
      path: '/api/notifications/subscription',
      summary: 'Subscribe to notification',
      description: 'API endpoint for subscribing to notification',
      request: {
        body: OpenApiRequestFactory.jsonBody(
          'Push subscription request body',
          zodPushSubscriptionDto
        ),
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccess('Subscribe to notification successful'),
        401: OpenApiResponseFactory.jsonUnauthorized('Unauthorized'),
        500: OpenApiResponseFactory.jsonInternalServerError('Internal server error'),
      },
    });

    // Implementation
    app.use(
      subscribeNotificationRoute.getRoutingPath(),
      this.authMiddleware.authorize({ isPublic: false })
    );
    app.openapi(subscribeNotificationRoute, async (c) => {
      // Get validated body
      const body = c.req.valid('json');

      // Get current user id
      const currentUserId = c.get('user')!.userId; // assured by auth middleware

      try {
        // Call service
        await this.notificationService.saveSubscription(currentUserId, body);

        const responseDto = ResponseDtoFactory.createSuccessResponseDto(
          'Subscribe to notification successful'
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
}
