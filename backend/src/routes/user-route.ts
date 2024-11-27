import { type OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { inject, injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/core/exception';
import { OpenApiRequestFactory, OpenApiResponseFactory, ResponseDtoFactory } from '@/dto/common';
import {
  type IGetProfileResponseBodyDto,
  type IUpdateProfileResponseBodyDto,
  getProfileResponseBodyDto,
  updateProfileRequestBodyDto,
  updateProfileResponseBodyDto,
  userIdRequestParamsDto,
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
    this.updateProfile(app);
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
      summary: 'Get user profile',
      description: 'API endpoint for getting user profile',
      request: {
        params: userIdRequestParamsDto,
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
        const { profile, isConnected } = await this.userService.getProfile(currentUserId, userId);

        // Map to dto
        const responseData: IGetProfileResponseBodyDto = {
          // level 1
          username: profile.username,
          name: profile.fullName || '',
          profile_photo: profile.profilePhotoPath,
          connection_count: profile._count.sentConnections,
          is_connected: isConnected,
          work_history: profile.workHistory,
          skills: profile.skills,
          // level 2
          relevant_posts:
            profile.feeds &&
            profile.feeds.map((feed) => ({
              ...feed,
              created_at: feed.createdAt,
              id: feed.id.toString(),
            })),
        };

        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          "User's profile successfully retrieved",
          responseData
        );

        // Return response
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
   * Update user profile
   *
   * @param app
   */
  private updateProfile(app: OpenAPIHono<IGlobalContext>) {
    const updateProfileRoute = createRoute({
      tags: ['user'],
      method: 'put',
      path: '/api/profile/{userId}',
      summary: 'Update user profile',
      description: 'API endpoint for updating user profile',
      request: {
        params: userIdRequestParamsDto,
        body: OpenApiRequestFactory.formDataBody(
          'Update Profile Request Body',
          updateProfileRequestBodyDto
        ),
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData(
          'Profile updated successfully',
          updateProfileResponseBodyDto
        ),
        400: OpenApiResponseFactory.jsonBadRequest(
          'Invalid input fields | username already exists'
        ),
        403: OpenApiResponseFactory.jsonForbidden('Forbidden to update other user profile'),
        404: OpenApiResponseFactory.jsonNotFound('User profile not found'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'An error occurred while updating user profile'
        ),
      },
    });

    // Register route
    app.use(
      updateProfileRoute.getRoutingPath(),
      this.authMiddleware.authorize({ isPublic: false })
    );
    app.openapi(updateProfileRoute, async (c) => {
      // Get validated params
      const { userId } = c.req.valid('param');

      // Get validated body
      const body = c.req.valid('form');

      // Get current user ID
      const currentUserId = c.var.user?.userId as bigint; // ensured by auth middleware

      try {
        // Update user profile
        const updatedUser = await this.userService.updateProfile(currentUserId, userId, body);

        // Map to dto
        const responseData: IUpdateProfileResponseBodyDto = {
          username: updatedUser.username,
          name: updatedUser.fullName || '',
          profile_photo: updatedUser.profilePhotoPath,
          work_history: updatedUser.workHistory,
          skills: updatedUser.skills,
        };

        // Return response
        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Profile updated successfully',
          responseData
        );
        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof BadRequestException) return c.json(e.toResponseDto(), 400);
        else if (e instanceof ForbiddenException) return c.json(e.toResponseDto(), 403);
        else if (e instanceof NotFoundException) return c.json(e.toResponseDto(), 404);
        else if (e instanceof InternalServerErrorException) return c.json(e.toResponseDto(), 500);

        // Internal server error
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }
}
