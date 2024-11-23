import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { deleteCookie, setCookie } from 'hono/cookie';
import { inject, injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import { BadRequestException, ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import {
  type ILoginRequestDto,
  type ILoginResponseDto,
  type IRegisterRequestDto,
  type IRegisterResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from '@/dto/auth-dto';
import { OpenApiRequestFactory, OpenApiResponseFactory, ResponseDtoFactory } from '@/dto/common';
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

        // Set cookie
        setCookie(c, 'auth-token', token, this.authService.generateCookieOptions());

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
    app.openapi(this.createRegisterRoute(), async (c) => {
      // Get validated body
      const body = await c.req.json<IRegisterRequestDto>();

      try {
        // Call service
        const newUser = await this.authService.register(body);

        // Automatically login
        const token = await this.authService.login({
          identifier: body.username,
          password: body.password,
        });

        // Map response to dto
        const responseData: IRegisterResponseDto = { token };
        const responseDto = ResponseDtoFactory.createSuccessDataResponseDto(
          'Register success',
          responseData
        );

        // Set cookie
        setCookie(c, 'auth-token', token, this.authService.generateCookieOptions());

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
     * Logout route
     */
    app.openapi(this.createLogoutRoute(), async (c) => {
      try {
        // Delete cookie
        deleteCookie(c, 'auth-token');

        return c.json(ResponseDtoFactory.createSuccessResponseDto('Logout success'), 200);
      } catch (e) {
        // Internal server error
        if (e instanceof Error) logger.error(e.message);
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }

  /**
   * login route definition
   */
  private createLoginRoute() {
    return createRoute({
      tags: ['auth'],
      method: 'post',
      path: '/api/login',
      request: {
        body: OpenApiRequestFactory.jsonBody('Login Request Body', LoginRequestDto),
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData('Login successfull', LoginResponseDto),
        400: OpenApiResponseFactory.jsonBadRequest('Invalid fields | Invalid credentials'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while logging in'
        ),
      },
    });
  }

  /**
   * Register route definition
   */
  private createRegisterRoute() {
    return createRoute({
      tags: ['auth'],
      method: 'post',
      path: '/api/register',
      request: {
        body: OpenApiRequestFactory.jsonBody('Register Request Body', RegisterRequestDto),
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData('Register successfull', RegisterResponseDto),
        400: OpenApiResponseFactory.jsonBadRequest(
          'Invalid fields | Username already exists | Email already exists'
        ),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while registering'
        ),
      },
    });
  }

  /**
   * Logout route definition
   */
  private createLogoutRoute() {
    return createRoute({
      tags: ['auth'],
      method: 'post',
      path: '/api/logout',
      request: {},
      responses: {
        200: OpenApiResponseFactory.jsonSuccess('Logout successfull'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while logging out'
        ),
      },
    });
  }
}
