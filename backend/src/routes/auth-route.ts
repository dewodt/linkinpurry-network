import { Router } from 'express';
import { inject, injectable } from 'inversify';

import { AuthController, IAuthController } from '@/controllers/auth-controller';

import { IRoute } from './route';

/**
 * Interface definition
 */
export interface IAuthRoute extends IRoute {}

/**
 * Route implementation
 * /auth/*
 */
@injectable()
export class AuthRoute implements IAuthRoute {
  // IoC key
  static readonly Key = Symbol.for('AuthRoute');

  // Dependencies
  constructor(@inject(AuthController.Key) private readonly authController: IAuthController) {}

  /**
   * Register route handlers
   * @param r Router
   * @returns void
   * @override
   */
  register(r: Router) {
    // Sign in
    r.post('/api/login', this.authController.login);

    // Sign up
    r.post('/api/register', this.authController.register);
  }
}
