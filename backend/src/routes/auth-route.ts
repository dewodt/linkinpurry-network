import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { deleteCookie, setCookie } from 'hono/cookie';
import { inject, injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import { BadRequestException } from '@/core/exception';
import { logger } from '@/core/logger';
import {
  type ILoginResponseBodyDto,
  type IRegisterResponseBodyDto,
  loginRequestBodyDto,
  loginResponseBodyDto,
  registerRequestBodyDto,
  registerResponseBodyDto,
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
  registerRoutes(app: OpenAPIHono<IGlobalContext>): void {
    // Login
    this.login(app);

    // Register
    this.register(app);

    // Logout
    this.logout(app);
  }

  /**
   * Login route
   *
   * @param app
   */
  private login(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const loginRoute = createRoute({
      tags: ['auth'],
      method: 'post',
      path: '/api/login',
      summary: 'Login user',
      description: 'API endpoint for logging in',
      request: {
        body: OpenApiRequestFactory.jsonBody('Login Request Body', loginRequestBodyDto),
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData('Login successfull', loginResponseBodyDto),
        400: OpenApiResponseFactory.jsonBadRequest('Invalid fields | Invalid credentials'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while logging in'
        ),
      },
    });

    // Register route
    app.openapi(loginRoute, async (c) => {
      // Get validated body
      const body = c.req.valid('json');

      try {
        // Call service
        const token = await this.authService.login(body);

        // Map response to dto
        const responseData: ILoginResponseBodyDto = { token };
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
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }

  /**
   * Register route
   */
  private register(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const registerRoute = createRoute({
      tags: ['auth'],
      method: 'post',
      path: '/api/register',
      summary: 'Register user',
      description: 'API endpoint for registering',
      request: {
        body: OpenApiRequestFactory.jsonBody('Register Request Body', registerRequestBodyDto),
      },
      responses: {
        200: OpenApiResponseFactory.jsonSuccessData(
          'Register successfull',
          registerResponseBodyDto
        ),
        400: OpenApiResponseFactory.jsonBadRequest(
          'Invalid fields | Username already exists | Email already exists'
        ),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while registering'
        ),
      },
    });

    // Register route
    app.openapi(registerRoute, async (c) => {
      // Get validated body
      const body = c.req.valid('json');

      try {
        // Call service
        const newUser = await this.authService.register(body);

        // Automatically login
        const token = await this.authService.login({
          identifier: body.username,
          password: body.password,
        });

        // Map response to dto
        const responseData: IRegisterResponseBodyDto = { token };
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
        const responseDto = ResponseDtoFactory.createErrorResponseDto('Internal server error');
        return c.json(responseDto, 500);
      }
    });
  }

  /**
   * Logout route
   */
  private logout(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const logoutRoute = createRoute({
      tags: ['auth'],
      method: 'post',
      path: '/api/logout',
      summary: 'Logout user',
      description: 'API endpoint for logging out',
      request: {},
      responses: {
        200: OpenApiResponseFactory.jsonSuccess('Logout successfull'),
        500: OpenApiResponseFactory.jsonInternalServerError(
          'Unexpected error occurred while logging out'
        ),
      },
    });

    // Register route
    app.openapi(logoutRoute, async (c) => {
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
}
