import type { Context, Next } from 'hono';

import type { IGlobalContext } from '@/core/app';

/**
 * Base type for Middleware functions
 */
export type MiddlewareFunction = (
  c: Context<IGlobalContext>,
  next: Next
) => Promise<void | Response>;
