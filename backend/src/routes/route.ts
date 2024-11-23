import { OpenAPIHono } from '@hono/zod-openapi';

import type { IGlobalContext } from '@/core/app';

export interface IRoute {
  register(app: OpenAPIHono<IGlobalContext>): void;
}
