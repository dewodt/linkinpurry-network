import express, { RequestHandler } from 'express';
import { inject, injectable } from 'inversify';

import { IController } from '@/controllers/controller';
import { logger } from '@/core/logger';
import { AuthService } from '@/services/auth-service';

/**
 * Interface definition
 */
export interface IAuthController extends IController {
  login: RequestHandler;
  logout: RequestHandler;
  register: RequestHandler;
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
  async login(req: express.Request, res: express.Response): Promise<void> {}

  /**
   * Logout controller
   *
   * @param req
   * @param res
   */
  async logout(req: express.Request, res: express.Response): Promise<void> {}

  /**
   *
   *
   * @param req
   * @param res
   */
  async register(req: express.Request, res: express.Response): Promise<void> {}
}
