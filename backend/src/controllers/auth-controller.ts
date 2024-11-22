import type { Context } from 'hono';
import { inject, injectable } from 'inversify';

import { type ControllerFunction, type IController } from '@/controllers/controller';
import { logger } from '@/core/logger';
import { AuthService } from '@/services/auth-service';

/**
 * Interface definition
 */
export interface IAuthController extends IController {
  login: ControllerFunction;
  logout: ControllerFunction;
  register: ControllerFunction;
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

  /**
   * Login controller
   *
   * @param req
   * @param res
   */
  login: ControllerFunction = async (c) => {
    return c.json({
      message: 'Login',
    });
  };

  /**
   * Logout controller
   *
   * @param req
   * @param res
   */
  logout: ControllerFunction = async (c) => {
    return c.json({
      message: 'Logout',
    });
  };

  /**
   * Register
   *
   * @param req
   * @param res
   */
  register: ControllerFunction = async (c) => {
    return c.json({
      message: 'Register',
    });
  };
}
