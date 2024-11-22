import express, { RequestHandler } from 'express';
import { inject, injectable } from 'inversify';

import { AuthService, IAuthService } from '@/services/auth-service';

import { IMiddleware } from './middleware';

/**
 * Interface definition
 */
export interface IAuthMiddleware extends IMiddleware {
  authorize: RequestHandler;
}

/**
 * Middleware implementation
 */
@injectable()
export class AuthMiddleware implements IAuthMiddleware {
  // IoC Key
  static readonly Key = Symbol.for('AuthMiddleware');

  // Dependency injected
  constructor(@inject(AuthService.Key) private authService: IAuthService) {}

  /**
   * Run method
   */
  async authorize(req: express.Request, res: express.Response, next: express.NextFunction) {
    // Get token
    const resolvedToken = this.getTokenFromCookie(req) || this.getTokenFromBearerToken(req);

    // if no token
    if (!resolvedToken) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Verify token
    const jwtPayload = await this.authService.verifyToken(resolvedToken);
    if (!jwtPayload) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Attach user to request
    req.user = jwtPayload;

    // Continue
    next();
  }

  /**
   * Get token from headers bearer token
   */
  private getTokenFromBearerToken(req: express.Request): string | null {
    if (req.headers && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');

      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
        return parts[1];
      }
    }

    return null;
  }

  /**
   * Get token from cookie
   */
  private getTokenFromCookie(req: express.Request): string | null {
    if (req.cookies && req.cookies['auth-token']) {
      return req.cookies['auth-token'];
    }

    return null;
  }
}
