import { inject, injectable } from 'inversify';

import { logger } from '@/core/logger';
import { AuthService } from '@/services/auth-service';

import { IController } from './controller';

/**
 * Interface definition
 */
export interface IAuthController extends IController {
  signIn(req: any, res: any): void;
  signOut(req: any, res: any): void;
  signUp(req: any, res: any): void;
}

/**
 * Controller implementation
 */
@injectable()
export class AuthController implements IAuthController {
  // IoC Key
  static readonly Key = Symbol.for('AuthController');

  // Dependency
  constructor(@inject(AuthService.Key) private readonly authService: AuthService) {}

  async signIn(req: any, res: any): Promise<void> {
    // Implement the signIn method
    res.send('signIn');
  }

  async signOut(req: any, res: any): Promise<void> {
    // Implement the signOut method
    res.send('signOut');
  }

  async signUp(req: any, res: any): Promise<void> {
    // Implement the signUp method
    res.send('signUp');
  }
}
