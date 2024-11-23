import { OpenAPIHono } from '@hono/zod-openapi';

import type { IGlobalContext } from '@/core/app';

export interface IRoute {
  registerRoutes(app: OpenAPIHono<IGlobalContext>): void;
}
