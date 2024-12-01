import { type Context } from 'hono';
import { deleteCookie, getCookie } from 'hono/cookie';
import { inject, injectable } from 'inversify';

import type { TSocket } from '@/core/websocket';
import type { JWTPayload } from '@/dto/auth-dto';
import { ResponseDtoFactory } from '@/dto/common';
import { AuthService } from '@/services/auth-service';

import type { MiddlewareFunction, SocketMiddlewareFunction } from './middleware';

/**
 * Auth Middleware interface definition
 */
export interface IAuthMiddleware {
  authorize({ isPublic }: { isPublic: boolean }): MiddlewareFunction;

  authorizeSocket({ isPublic }: { isPublic: boolean }): SocketMiddlewareFunction;
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

  authorizeSocket({ isPublic }: { isPublic: boolean } = { isPublic: true }) {
    return async (socket: TSocket, next: (err?: Error) => void) => {
      // Get token
      const resolvedToken =
        this.getTokenFromSocketCookie(socket) || this.getTokenFromSocketBearerToken(socket) || null;

      // if no token
      if (!isPublic && !resolvedToken) {
        const errorResponse = ResponseDtoFactory.createErrorResponseDto('Unathorized');
        next(new Error('Unathorized'));
      }

      // Verify token
      if (resolvedToken) {
        let jwtPayload: JWTPayload | null = null;

        try {
          jwtPayload = await this.authService.verifyToken(resolvedToken);

          // Attach user to request
          socket.data.user = jwtPayload;
        } catch (error) {
          // If token is not public and not verified
          if (!isPublic) {
            const errorResponse = ResponseDtoFactory.createErrorResponseDto('Unathorized');
            next(new Error('Unathorized'));
          }
        }
      }
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

  /**
   * Get token from socket (cookie)
   */
  private getTokenFromSocketCookie(socket: TSocket): string | null {
    const cookieString = socket.handshake.headers.cookie;
    if (!cookieString) return null;

    const cookies = cookieString.split(';').reduce(
      (acc, pair) => {
        const [key, value] = pair.trim().split('=');
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );

    return cookies['auth-token'] || null;
  }

  /**
   * Get token from socket (bearer token)
   */
  private getTokenFromSocketBearerToken(socket: TSocket): string | null {
    const authorization = socket.handshake.headers.authorization;
    if (!authorization) return null;

    const parts = authorization.split(' ');

    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      return parts[1];
    }

    return null;
  }
}
