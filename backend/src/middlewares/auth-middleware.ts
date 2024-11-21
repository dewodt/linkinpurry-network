import { injectable } from 'inversify';

import { IMiddleware } from './middleware';

/**
 * Interface definition
 */
export interface IAuthMiddleware extends IMiddleware {
  verifyToken(token: string): Promise<boolean>;
  authorize(): Promise<boolean>;
}

/**
 * Middleware implementation
 */
@injectable()
export class AuthMiddleware implements IAuthMiddleware {
  static readonly Key = Symbol.for('AuthMiddleware');

  async verifyToken(token: string): Promise<boolean> {
    // Implement the verifyToken method
    return true;
  }

  async authorize(): Promise<boolean> {
    // Implement the authorize method
    return true;
  }
}
