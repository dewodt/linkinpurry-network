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

  signIn(req: any, res: any): void {
    // Implement the signIn method
    logger.info(this.authService.signIn('email', 'password'));
    res.send('signIn');
  }

  signOut(req: any, res: any): void {
    // Implement the signOut method
    // logger.info(this.authService.signUp('email', 'password'));
    res.send('signOut');
  }

  signUp(req: any, res: any): void {
    // Implement the signUp method
    logger.info(this.authService.signUp('email', 'password'));
    res.send('signUp');
  }
}
