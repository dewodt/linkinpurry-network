import type { Context } from 'hono';

import type { IGlobalContext } from '@/core/app';

/**
 * Controller base interface
 */
export interface IController {}

/**
 * Controller function contract
 */
export type ControllerFunction = (c: Context<IGlobalContext>) => Promise<Response>;
