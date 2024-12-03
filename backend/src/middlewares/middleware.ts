import type { Context, Next } from 'hono';

import type { IGlobalContext } from '@/core/app';
import type { TSocket } from '@/core/websocket';

/**
 * Base type for Middleware functions
 */
export type MiddlewareFunction = (
  c: Context<IGlobalContext>,
  next: Next
) => Promise<void | Response>;

export type SocketMiddlewareFunction = (socket: TSocket, next: (err?: Error) => void) => void;
