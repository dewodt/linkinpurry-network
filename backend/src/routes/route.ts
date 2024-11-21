import { Router } from 'express';

/**
 * Base interface for routes
 */
export interface IRoute {
  register(router: Router): void;
}
