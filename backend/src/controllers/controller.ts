import type { Context } from 'hono';

import type { GlobalContextVariable } from '@/core/app';

/**
 * Controller base interface
 */
export interface IController {}

/**
 * Controller function contract
 */
export type ControllerFunction = (
  c: Context<{ Variables: GlobalContextVariable }>
) => Promise<Response>;
