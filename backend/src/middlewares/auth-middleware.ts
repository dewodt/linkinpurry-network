import { type Context } from 'hono';
import { deleteCookie, getCookie } from 'hono/cookie';
import { inject, injectable } from 'inversify';

import type { JWTPayload } from '@/dto/auth-dto';
import { ResponseDtoFactory } from '@/dto/common';
import { AuthService } from '@/services/auth-service';

import type { MiddlewareFunction } from './middleware';

/**
 * Auth Middleware interface definition
 */
export interface IAuthMiddleware {
  authorize({ isPublic }: { isPublic: boolean }): MiddlewareFunction;
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
  authorize({ isPublic }: { isPublic: boolean } = { isPublic: true }): MiddlewareFunction {
    return async (c, next) => {
      // Get token
      const resolvedToken = this.getTokenFromCookie(c) || this.getTokenFromBearerToken(c) || null;

      // if no token
      if (!isPublic && !resolvedToken) {
        const errorResponse = ResponseDtoFactory.createErrorResponseDto('Unathorized');
        return c.json(errorResponse, 401);
      }

      // Verify token
      if (resolvedToken) {
        let jwtPayload: JWTPayload | null = null;

        try {
          jwtPayload = await this.authService.verifyToken(resolvedToken);

          // Attach user to request
          c.set('user', jwtPayload);
        } catch (error) {
          // Remove token from cookie (if exists)
          deleteCookie(c, 'auth-token');

          // If token is not public and not verified
          if (!isPublic) {
            const errorResponse = ResponseDtoFactory.createErrorResponseDto('Unathorized');
            return c.json(errorResponse, 401);
          }
        }
      }

      await next();
    };
  }

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
