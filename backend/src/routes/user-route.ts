import { type OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { inject, injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import { NotFoundException } from '@/core/exception';
import { loginRequestBodyDto, loginResponseBodyDto } from '@/dto/auth-dto';
import { OpenApiRequestFactory, OpenApiResponseFactory, ResponseDtoFactory } from '@/dto/common';
import {
  type IGetProfileResponseBodyDto,
  getProfileRequestParamsDto,
  getProfileResponseBodyDto,
} from '@/dto/user-dto';
import { AuthMiddleware } from '@/middlewares/auth-middleware';
import { UserService } from '@/services/user-service';

import type { IRoute } from './route';

@injectable()
export class UserRoute implements IRoute {
  // IoC key
  static readonly Key = Symbol.for('UserRoute');

  // Dependencies
  constructor(
    @inject(UserService.Key) private userService: UserService,
    @inject(AuthMiddleware.Key) private authMiddleware: AuthMiddleware
  ) {}

  /**
   * Register route handlers
   * @param r Router
   * @returns void
   * @override
   */
  registerRoutes(app: OpenAPIHono<IGlobalContext>): void {
    // Get user profile
    this.getProfile(app);

    // Update user profile
  }

  /**
   * Get user profile
   * @param app
   * @returns void
   */
  private getProfile(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const getProfileRoute = createRoute({
      tags: ['user'],
      method: 'get',
      path: '/api/profile/{userId}',
      request: {
        params: getProfileRequestParamsDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData(
          "User's profile successfully retrieved",
          getProfileResponseBodyDto
        ),
        404: OpenApiResponseFactory.jsonNotFound('User profile not found'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'An error occurred while retrieving user profile'
        ),
      },
    });

    // Register route
    app.use(getProfileRoute.getRoutingPath(), this.authMiddleware.authorize({ isPublic: true }));
    app.openapi(getProfileRoute, async (c) => {
      // Get validated params
      const { userId } = c.req.valid('param');

      // Get current user ID
      const currentUserId = c.var.user?.userId;

      try {
        // Get user profile
        const profile = await this.userService.getProfile(userId, currentUserId);

        // Map to dto
        const responseData: IGetProfileResponseBodyDto = {
          username: profile.username,
          name: profile.name || 'N/A',
          profile_photo: profile.profilePhotoPath,
          connection_count: profile._count.sentConnections,
          relevant_posts: profile.feeds,
          skills: profile.skills,
          work_history: profile.workHistory,
        };

        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          "User's profile successfully retrieved",
          responseData
        );

        // Return response
        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof NotFoundException) {
          return c.json(e.toResponseDto(), 404);
        }

        // Internal server error
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }
}
