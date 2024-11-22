import type { Context, Next } from 'hono';

import type { GlobalContextVariable } from '@/core/app';

/**
 * Base interface for all middlewares
 */
export interface IMiddleware {}

/**
 * Base type for Middleware functions
 */
export type MiddlewareFunction = (
  c: Context<{ Variables: GlobalContextVariable }>,
  next: Next
) => Promise<void | Response>;
