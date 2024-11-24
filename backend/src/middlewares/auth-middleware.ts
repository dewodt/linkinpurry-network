import { type Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { inject, injectable } from 'inversify';

import type { JWTPayload } from '@/dto/auth-dto';
import { ResponseDtoFactory } from '@/dto/common';
import { AuthService } from '@/services/auth-service';

import type { MiddlewareFunction } from './middleware';

/**
 * Auth Middleware interface definition
 */
export interface IAuthMiddleware {
  authorize: MiddlewareFunction;
}

/**
 * Auth Middleware implementation
 */
@injectable()
export class AuthMiddleware implements IAuthMiddleware {
  // IoC Key
  static readonly Key = Symbol.for('AuthMiddleware');

  // Dependency injected
  constructor(@inject(AuthService.Key) private authService: AuthService) {}

  /**
   * Authorize middleware
   */
  authorize: MiddlewareFunction = async (c, next) => {
    // Get token
    const resolvedToken = this.getTokenFromCookie(c) || this.getTokenFromBearerToken(c) || null;

    // if no token
    if (!resolvedToken) {
      const errorResponse = ResponseDtoFactory.createErrorResponseDto('Unathorized');
      return c.json(errorResponse, 401);
    }

    // Verify token
    let jwtPayload: JWTPayload | null = null;
    try {
      jwtPayload = await this.authService.verifyToken(resolvedToken);
    } catch (error) {
      const errorResponse = ResponseDtoFactory.createErrorResponseDto('Unathorized');

      return c.json(errorResponse, 401);
    }

    // Attach user to request
    c.set('user', jwtPayload);

    await next();
  };

  /**
   * Get token from headers bearer token
   */
  private getTokenFromBearerToken(c: Context): string | null {
    const authorization = c.req.header('Authorization');

    if (authorization) {
      const parts = authorization.split(' ');

      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
        return parts[1];
      }
    }

    return null;
  }

  /**
   * Get token from cookie
   */
  private getTokenFromCookie(c: Context): string | null {
    const authToken = getCookie(c, 'auth-token');

    return authToken || null;
  }
}
