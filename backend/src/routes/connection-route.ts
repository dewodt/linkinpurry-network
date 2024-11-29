import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { inject, injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@/core/exception';
import { OpenApiRequestFactory, OpenApiResponseFactory, ResponseDtoFactory } from '@/dto/common';
import {
  CreateConnectionReqRequestBodyDto,
  DecideConnectionReqRequestBodyDto,
  DecideConnectionReqRequestParamsDto,
  DecideConnectionReqResponseBodyDto,
  GetConnectionListRequestParamsDto,
  GetConnectionListRequestQueryDto,
  GetConnectionListResponseBodyDto,
  GetPendingConnectionReqRequestQueryDto,
  GetPendingConnectionReqResponseBodyDto,
  type ICreateConnectionReqResponseBodyDto,
  type IGetConnectionListResponseBodyDto,
  type IGetPendingConnectionReqResponseBodyDto,
  UnconnectRequestParamsDto,
  UnconnectResponseBodyDto,
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

    // Get pending connections
    this.getPendingConnections(app);

    // Decide connection request
    this.decideConnectionRequest(app);

    // Unconnect user
    this.unconnectUser(app);
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
        if (e instanceof BadRequestException) return c.json(e.toResponseDto(), 400);
        else if (e instanceof NotFoundException) return c.json(e.toResponseDto(), 404);
        else if (e instanceof InternalServerErrorException) return c.json(e.toResponseDto(), 500);

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
      summary: 'Get list of connections',
      description: 'API endpoint for getting list of connections of a user',
      request: {
        params: GetConnectionListRequestParamsDto,
        query: GetConnectionListRequestQueryDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessPagePagination(
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

  /**
   * (Protected)
   * Get user's pending connection
   */
  private getPendingConnections(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const pendingConnectionsRoute = createRoute({
      tags: ['connection'],
      method: 'get',
      path: '/api/connections/requests/pending',
      summary: 'Get list of pending connection requests',
      description: 'API endpoint for getting list of pending connection requests',
      request: {
        query: GetPendingConnectionReqRequestQueryDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessPagePagination(
          'Get list of pending connection requests successful',
          GetPendingConnectionReqResponseBodyDto
        ),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while getting list of pending connection requests'
        ),
      },
    });

    // Register route
    app.use(
      pendingConnectionsRoute.getRoutingPath(),
      this.authMiddleware.authorize({ isPublic: false })
    );
    app.openapi(pendingConnectionsRoute, async (c) => {
      // Get query params
      const { page, limit } = c.req.valid('query');

      // Get current user id
      const currentUserId = c.get('user')!.userId; // assured by auth middleware

      // Call service
      try {
        const { requests: rawRequests, meta } = await this.ConnectionService.getPendingConnections(
          currentUserId,
          page,
          limit
        );

        // Map response to dto
        const responseData: IGetPendingConnectionReqResponseBodyDto = rawRequests.map((user) => {
          return {
            user_id: user.id.toString(),
            username: user.username,
            name: user.fullName,
            profile_photo: user.profilePhotoPath,
            work_history: user.workHistory,
          };
        });

        const responseDto = ResponseDtoFactory.createSuccessPagePaginationResponseDto(
          'Pending connection requests fetched successfully',
          responseData,
          meta
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
   * (Protected)
   *
   * Decide connection request
   *
   * @param app
   */
  private decideConnectionRequest(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const decideConnectionRequestRoute = createRoute({
      tags: ['connection'],
      method: 'post', // use POST (because PUT must be idempotent, and this is not)
      path: '/api/connections/requests/{fromUserId}/decision',
      summary: 'Decide connection request',
      description: 'API endpoint for deciding connection request',
      request: {
        params: DecideConnectionReqRequestParamsDto,
        body: OpenApiRequestFactory.jsonBody(
          'Decide Connection Request Body',
          DecideConnectionReqRequestBodyDto
        ),
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData(
          'Connection request decided successfully',
          DecideConnectionReqResponseBodyDto
        ),
        404: OpenApiResponseFactory.jsonNotFound('Connection request not found'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while deciding connection request'
        ),
      },
    });

    // Register route
    app.use(
      decideConnectionRequestRoute.getRoutingPath(),
      this.authMiddleware.authorize({ isPublic: false })
    );
    app.openapi(decideConnectionRequestRoute, async (c) => {
      // Get validated params
      const { fromUserId } = c.req.valid('param');

      // Get validated body
      const body = c.req.valid('json');

      // Get current user ID
      const currentUserId = c.get('user')!.userId; // assured by auth middleware

      // Call service
      try {
        await this.ConnectionService.decideConnectionRequest(
          currentUserId,
          fromUserId,
          body.decision
        );

        // Map to dto
        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Connection request decided',
          null
        );

        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof NotFoundException) return c.json(e.toResponseDto(), 404);
        else if (e instanceof InternalServerErrorException) return c.json(e.toResponseDto(), 500);

        // Other errors
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }

  /**
   * (Protected)
   *
   * Unconnect user
   *
   * @param app
   */
  private unconnectUser(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const unconnectUserRoute = createRoute({
      tags: ['connection'],
      method: 'delete',
      path: '/api/connections/{toUserId}',
      summary: 'Unconnect user',
      description: 'API endpoint for unconnecting user',
      request: {
        params: UnconnectRequestParamsDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData(
          'User unconnected successfully',
          UnconnectResponseBodyDto
        ),
        400: OpenApiResponseFactory.jsonBadRequest('Invalid fields | unconnect self'),
        404: OpenApiResponseFactory.jsonNotFound('Connection not found'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while unconnecting user'
        ),
      },
    });

    // Register route
    app.use(
      unconnectUserRoute.getRoutingPath(),
      this.authMiddleware.authorize({ isPublic: false })
    );

    app.openapi(unconnectUserRoute, async (c) => {
      // Get validated params
      const { toUserId } = c.req.valid('param');

      // Get current user ID
      const currentUserId = c.get('user')!.userId; // assured by auth middleware

      // Call service
      try {
        await this.ConnectionService.unconnectUser(currentUserId, toUserId);

        // Map to dto
        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'User unconnected successfully',
          null
        );

        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof BadRequestException) return c.json(e.toResponseDto(), 400);
        else if (e instanceof NotFoundException) return c.json(e.toResponseDto(), 404);
        else if (e instanceof InternalServerErrorException) return c.json(e.toResponseDto(), 500);

        // Other errors
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }
}
