import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { inject, injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import { BadRequestException, NotFoundException } from '@/core/exception';
import { OpenApiRequestFactory, OpenApiResponseFactory, ResponseDtoFactory } from '@/dto/common';
import {
  CreateConnectionReqRequestBodyDto,
  GetConnectionListRequestParamsDto,
  GetConnectionListRequestQueryDto,
  GetConnectionListResponseBodyDto,
  type ICreateConnectionReqResponseBodyDto,
  type IGetConnectionListResponseBodyDto,
} from '@/dto/connection-dto';
import { AuthMiddleware } from '@/middlewares/auth-middleware';
import { ConnectionService } from '@/services/connection-service';

import { CreateConnectionReqResponseBodyDto } from './../dto/connection-dto';
import type { IRoute } from './route';

/**
 * Connection Route implementation
 */
@injectable()
export class ConnectionRoute implements IRoute {
  // IoC key
  static readonly Key = Symbol.for('ConnectionRoute');

  // Dependencies
  constructor(
    @inject(AuthMiddleware.Key) private authMiddleware: AuthMiddleware,
    @inject(ConnectionService.Key) private ConnectionService: ConnectionService
  ) {}

  /**
   * Register route handlers
   * @param r Router
   * @returns void
   * @override
   */
  registerRoutes(app: OpenAPIHono<IGlobalContext>): void {
    // Create connection
    this.createConnectionRequest(app);

    // Get connection list
    this.getConnectionsList(app);

    // this.connectionList(app);
    // this.connectionDecide(app);
    // this.connectionRequest(app);
  }

  /**
   * (Protected)
   * Create request connection to another user
   */
  private createConnectionRequest(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const createConnectionRequestRoute = createRoute({
      tags: ['connection'],
      method: 'post',
      path: '/api/connections/requests',
      summary: 'Create connection request',
      description: 'API endpoint for creating connection request',
      request: {
        body: OpenApiRequestFactory.jsonBody(
          'Create Connection Request Body',
          CreateConnectionReqRequestBodyDto
        ),
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData(
          'Connection request created successfully',
          CreateConnectionReqResponseBodyDto
        ),
        400: OpenApiResponseFactory.jsonBadRequest(
          'Invalid fields | send request to self | already connected | already sent request'
        ),
        404: OpenApiResponseFactory.jsonNotFound('User not found'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while creating connection request'
        ),
      },
    });

    // Register route
    app.use(
      createConnectionRequestRoute.getRoutingPath(),
      this.authMiddleware.authorize({ isPublic: false })
    );
    app.openapi(createConnectionRequestRoute, async (c) => {
      // Get validated body
      const body = c.req.valid('json');

      // Get current user ID
      const { userId } = c.get('user')!; // assured by auth middleware

      // Call service
      try {
        const { finalState } = await this.ConnectionService.createConnectionRequest(
          userId,
          body.toUserId
        );

        // Map to dto
        const responseData: ICreateConnectionReqResponseBodyDto = { finalState };

        // Map response to dto
        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Connection request created successfully',
          responseData
        );

        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof BadRequestException) {
          return c.json(e.toResponseDto(), 400);
        } else if (e instanceof NotFoundException) {
          return c.json(e.toResponseDto(), 404);
        }

        // Internal server error
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }

  /**
   * (Public)
   * ENHANCEMENT: use pagination
   * See list of connections of any users
   *
   * @param app
   */
  private getConnectionsList(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const connectionListRoute = createRoute({
      tags: ['connection'],
      method: 'get',
      path: '/api/users/{userId}/connections',
      request: {
        params: GetConnectionListRequestParamsDto,
        query: GetConnectionListRequestQueryDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData(
          'Get List Connection successful',
          GetConnectionListResponseBodyDto
        ),
        400: OpenApiResponseFactory.jsonBadRequest('Invalid query params or path params'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while getting list of connection'
        ),
      },
    });

    // Register route
    app.use(
      connectionListRoute.getRoutingPath(),
      this.authMiddleware.authorize({ isPublic: true })
    );
    app.openapi(connectionListRoute, async (c) => {
      // Get validated params
      const { userId } = c.req.valid('param');

      // Query
      const { search, page, limit } = c.req.valid('query');

      // Get current user id
      const currentUserId = c.get('user')?.userId;

      try {
        // Call service
        const { connections, meta } = await this.ConnectionService.getConnectionsList(
          currentUserId,
          userId,
          search,
          page,
          limit
        );

        // Map response to dto
        const responseData: IGetConnectionListResponseBodyDto = connections.map((user) => {
          return {
            user_id: user.id.toString(),
            username: user.username,
            name: user.fullName,
            profile_photo: user.profilePhotoPath,
            work_history: user.workHistory,
            connection_status: user.connectionStatus,
          };
        });
        const responseDto = ResponseDtoFactory.createSuccessPagePaginationResponseDto(
          "User's connections fetched successfully",
          responseData,
          meta
        );

        // Meta data
        return c.json(responseDto, 200);
      } catch (e) {
        // Internal server error
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }

  // private connectionDecide(app: OpenAPIHono<IGlobalContext>) {
  //   const AcceptorRejectRequestBodyDtoContent = {
  //     content: {
  //       'application/json': AcceptorRejectRequestBodyDto,
  //     },
  //   };
  //   // Create route definition
  //   const connectionDecideRoute = createRoute({
  //     tags: ['Connection'],
  //     method: 'post',
  //     path: '/api/user/{userId}/decide',
  //     request: {
  //       params: AcceptorRejectParamsDto,
  //       body: AcceptorRejectRequestBodyDto,
  //     },
  //     responses: {
  //       200: OpenApiResponseFactory.jsonSuccessData(
  //         'Get List Connection successful',
  //         AcceptorRejectResponseBodyDto
  //       ),
  //       400: OpenApiResponseFactory.jsonBadRequest('Invalid fields | Invalid credentials'),
  //       500: OpenApiResponseFactory.jsonInternalServerError(
  //         'Unexpected error occurred while getting list of connection'
  //       ),
  //     },
  //   });
  //   // Register route
  //   app.openapi(connectionDecideRoute, async (c) => {
  //     // Get validated params
  //     const { userId } = c.req.valid('param');
  //     const body = c.req.valid('json');

  //     try {
  //       const decisionResult = await this.ConnectionService.decideConnection(
  //         userId,
  //         body.requestId,
  //         userId,
  //         body.action
  //       );

  //       const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
  //         'Connection decision processed successfully',
  //         decisionResult
  //       );

  //       return c.json(responseDto, 200);
  //     } catch (e) {
  //       if (e instanceof BadRequestException) {
  //         return c.json(e.toResponseDto(), 400);
  //       }

  //       const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
  //       return c.json(responseDto, 500);
  //     }
  //   });
  // }

  // // Get Connection Requested
  // private connectionRequest(app: OpenAPIHono<IGlobalContext>) {
  //   // Create route definition
  //   const connectionRequestRoute = createRoute({
  //     tags: ['Connection'],
  //     method: 'get',
  //     path: '/connection_request/{userId}',
  //     request: {
  //       params: RequestConnectionBodyDTO,
  //     },
  //     responses: {
  //       200: OpenApiResponseFactory.jsonSuccessData(
  //         'Get Connection Request successful',
  //         RequestConnectionResponseBodyDTO
  //       ),
  //       400: OpenApiResponseFactory.jsonBadRequest('Invalid fields | Invalid credentials'),
  //       500: OpenApiResponseFactory.jsonInternalServerError(
  //         'Unexpected error occurred while getting list of connection'
  //       ),
  //     },
  //   });
  //   // Register route
  //   app.openapi(connectionRequestRoute, async (c) => {
  //     // Get validated params
  //     const { userId } = c.req.valid('param');

  //     try {
  //       // Call Connection Service
  //       const requestsList = await this.ConnectionService.getConnectionRequestTo(userId);

  //       // Map response to dto
  //       const responseData: IRequestConnectionResponseBodyDTO = { requestsList };
  //       const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
  //         'Connection requests fetched successfully',
  //         responseData
  //       );

  //       return c.json(responseDto, 200);
  //     } catch (e) {
  //       // Handle service exception
  //       if (e instanceof BadRequestException) {
  //         return c.json(e.toResponseDto(), 400);
  //       }

  //       // Internal server error
  //       const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
  //       return c.json(responseDto, 500);
  //     }
  //   });
  // }
}
