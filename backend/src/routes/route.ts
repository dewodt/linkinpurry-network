import type { Hono } from 'hono';

import type { GlobalContextVariable } from '@/core/app';

/**
 * Base interface for routes
 */
export interface IRoute {
  register(app: Hono<{ Variables: GlobalContextVariable }>): void;
}
