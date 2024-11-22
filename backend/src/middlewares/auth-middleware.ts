import { type Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { inject, injectable } from 'inversify';

import { AuthService } from '@/services/auth-service';

import { type IMiddleware, type MiddlewareFunction } from './middleware';

/**
 * Interface definition
 */
export interface IAuthMiddleware extends IMiddleware {
  authorize: MiddlewareFunction;
}

/**
 * Middleware implementation
 */
@injectable()
export class AuthMiddleware implements IAuthMiddleware {
  // IoC Key
  static readonly Key = Symbol.for('AuthMiddleware');

  // Dependency injected
  constructor(@inject(AuthService.Key) private authService: AuthService) {}

  /**
   * Run method
   */
  authorize: MiddlewareFunction = async (c, next) => {
    // Get token
    const resolvedToken = this.getTokenFromCookie(c) || this.getTokenFromBearerToken(c) || null;

    // if no token
    if (!resolvedToken) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    // Verify token
    const jwtPayload = await this.authService.verifyToken(resolvedToken);
    if (!jwtPayload) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    // Attach user to request
    c.set('user', jwtPayload);

    next();
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
