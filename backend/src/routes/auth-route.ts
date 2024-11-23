import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { inject, injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import { BadRequestException } from '@/core/exception';
import { logger } from '@/core/logger';
import {
  type ILoginRequestDto,
  type ILoginResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from '@/dto/auth-dto';
import { OpenApiResponseFactory, ResponseDtoFactory } from '@/dto/common';
import { AuthService } from '@/services/auth-service';

import type { IRoute } from './route';

/**
 * Auth Route implementation
 */
@injectable()
export class AuthRoute implements IRoute {
  // IoC key
  static readonly Key = Symbol.for('AuthRoute');

  // Dependencies
  constructor(@inject(AuthService.Key) private authService: AuthService) {}

  /**
   * Register route handlers
   * @param r Router
   * @returns void
   * @override
   */
  register(app: OpenAPIHono<IGlobalContext>): void {
    /**
     * Login route
     */
    app.openapi(this.createLoginRoute(), async (c) => {
      // Get validated body
      const body = await c.req.json<ILoginRequestDto>();

      try {
        // Call service
        const token = await this.authService.login(body);

        // Map response to dto
        const responseData: ILoginResponseDto = { token };
        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Login success',
          responseData
        );

        return c.json(responseDto, 200);
      } catch (e) {
        // Handle service exception
        if (e instanceof BadRequestException) {
          return c.json(e.toResponseDto(), 400);
        }

        // Internal server error
        if (e instanceof Error) logger.error(e.message);
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });

    /**
     * Register route (automatically login)
     */
    app.openapi(this.createRegisterRoute(), async (c) => {});

    /**
     * Logout route
     */
    app.openapi(this.createLogoutRoute(), async (c) => {});
  }

  /**
   * login route
   */
  private createLoginRoute() {
    return createRoute({
      method: 'post',
      path: '/api/login',
      middleware: [],
      request: {
        body: {
          required: true,
          description: 'Login request',
          content: {
            'application/json': {
              schema: LoginRequestDto,
            },
          },
        },
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData(LoginResponseDto),
        400: OpenApiResponseFactory.jsonBadRequest(),
        500: OpenApiResponseFactory.jsonInternalServerError(),
      },
    });
  }

  /**
   * register route
   */
  private createRegisterRoute() {
    return createRoute({
      method: 'post',
      path: '/api/register',
      middleware: [],
      request: {
        body: {
          required: true,
          description: 'Register request',
          content: {
            'application/json': {
              schema: RegisterRequestDto,
            },
          },
        },
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData(RegisterResponseDto),
        400: OpenApiResponseFactory.jsonBadRequest(),
        500: OpenApiResponseFactory.jsonInternalServerError(),
      },
    });
  }

  /**
   * logout route
   */
  private createLogoutRoute() {
    return createRoute({
      method: 'post',
      path: '/api/logout',
      middleware: [],
      request: {
        body: {
          required: true,
          description: 'Logout request',
          content: {
            'application/json': {
              schema: LoginRequestDto,
            },
          },
        },
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData(LoginResponseDto),
        500: OpenApiResponseFactory.jsonInternalServerError(),
      },
    });
  }
}
