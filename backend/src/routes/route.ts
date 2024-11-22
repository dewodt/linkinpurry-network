import type { Hono } from 'hono';

import type { IGlobalContext } from '@/core/app';

/**
 * Base interface for routes
 */
export interface IRoute {
  register(app: Hono<IGlobalContext>): void;
}
