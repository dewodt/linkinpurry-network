import { Hono } from 'hono';
import { inject, injectable } from 'inversify';

import { AuthController, type IAuthController } from '@/controllers/auth-controller';
import type { GlobalContextVariable } from '@/core/app';

import { type IRoute } from './route';

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
  register(app: Hono<{ Variables: GlobalContextVariable }>) {
    // Sign in
    app.post('/api/login', this.authController.login);

    // Sign up
    app.post('/api/register', this.authController.register);
  }
}
