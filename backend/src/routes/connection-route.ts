import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { deleteCookie, setCookie } from 'hono/cookie';
import { inject, injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import { BadRequestException } from '@/core/exception';
import { logger } from '@/core/logger';
import { OpenApiRequestFactory, OpenApiResponseFactory, ResponseDtoFactory } from '@/dto/common';
import {
  AcceptorRejectParamsDto,
  AcceptorRejectRequestBodyDto,
  AcceptorRejectResponseBodyDto,
  type IAcceptorRejectParamsDto,
  type IAcceptorRejectResponseBodyDto,
  type IListConnectionsBodyDto,
  type IListConnectionsResponseBodyDto,
  type IRequestConnectionResponseBodyDTO,
  ListConnectionsBodyDto,
  ListConnectionsResponseBodyDto,
  RequestConnectionBodyDTO,
  RequestConnectionResponseBodyDTO,
} from '@/dto/connection-dto';
import { ConnectionService } from '@/services/connection-service';

import type { IRoute } from './route';

/**
 * Connection Route implementation
 */
@injectable()
export class ConnectionRoute implements IRoute {
  // IoC key
  static readonly Key = Symbol.for('ConnectionRoute');

  // Dependencies
  constructor(@inject(ConnectionService.Key) private ConnectionService: ConnectionService) {}

  /**
   * Register route handlers
   * @param r Router
   * @returns void
   * @override
   */
  registerRoutes(app: OpenAPIHono<IGlobalContext>): void {
    // Login
    this.connectionList(app);
    this.connectionDecide(app);
    this.connectionRequest(app);
  }

  /**
   * connectionList route
   *
   * @param app
   */
  private connectionList(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const connectionListRoute = createRoute({
      tags: ['Connection'],
      method: 'get',
      path: '/connection/{userId}',
      request: {
        params: ListConnectionsBodyDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData('Get List Connection successful', ListConnectionsResponseBodyDto),
        400: OpenApiResponseFactory.jsonBadRequest('Invalid fields | Invalid credentials'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while getting list of connection'
        ),
      },
    });
    // Register route
    app.openapi(connectionListRoute, async (c) => {
      // Get validated params
      const { userId } = c.req.valid('param');

      try {
        // Call service
        const connections = await this.ConnectionService.listConnection(userId);

        // Map response to dto
        const responseData: IListConnectionsResponseBodyDto = { connections };
        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Connection list fetched successfully',
          responseData
        );

        // Set cookie (if needed for authentication, token generation)
        setCookie(c, 'auth-token', 'your-token-value', { httpOnly: true, secure: true });

        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof BadRequestException) {
          return c.json(e.toResponseDto(), 400);
        }

        // Internal server error
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }

  private connectionDecide(app: OpenAPIHono<IGlobalContext>) {
    const AcceptorRejectRequestBodyDtoContent = {
      content: {
        'application/json': AcceptorRejectRequestBodyDto,
      },
    };
    // Create route definition
    const connectionDecideRoute = createRoute({
      tags: ['Connection'],
      method: 'post',
      path: '/api/user/{userId}/decide',
      request: {
        params : AcceptorRejectParamsDto,
        body : AcceptorRejectRequestBodyDto,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData('Get List Connection successful', AcceptorRejectResponseBodyDto),
        400: OpenApiResponseFactory.jsonBadRequest('Invalid fields | Invalid credentials'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while getting list of connection'
        ),
      },
    });
    // Register route
    app.openapi(connectionDecideRoute, async (c) => {
      // Get validated params
      const { userId } = c.req.valid('param');
      const body = c.req.valid('json');

      try {
        const decisionResult = await this.ConnectionService.decideConnection(
          userId,
          body.requestId,
          userId,
          body.action
        );

        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Connection decision processed successfully',
          decisionResult
        );

        return c.json(responseDto, 200);
      } catch (e) {
        if (e instanceof BadRequestException) {
          return c.json(e.toResponseDto(), 400);
        }

        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }

  // Get Connection Requested
  private connectionRequest(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const connectionRequestRoute = createRoute({
      tags: ['Connection'],
      method: 'get',
      path: '/connection_request/{userId}',
      request: {
        params: RequestConnectionBodyDTO,
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData(
          'Get Connection Request successful',
          RequestConnectionResponseBodyDTO
        ),
        400: OpenApiResponseFactory.jsonBadRequest('Invalid fields | Invalid credentials'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while getting list of connection'
        ),
      },
    });
    // Register route
    app.openapi(connectionRequestRoute, async (c) => {
      // Get validated params
      const { userId } = c.req.valid('param');

      try {
        // Call Connection Service
        const requestsList = await this.ConnectionService.getConnectionRequestTo(userId);

        // Map response to dto
        const responseData: IRequestConnectionResponseBodyDTO = { requestsList };
        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Connection requests fetched successfully',
          responseData
        );

        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof BadRequestException) {
          return c.json(e.toResponseDto(), 400);
        }

        // Internal server error
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }
}
