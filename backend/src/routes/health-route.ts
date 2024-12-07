import { type OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { injectable } from 'inversify';

import type { IGlobalContext } from '@/core/app';
import { OpenApiResponseFactory, ResponseDtoFactory } from '@/dto/common';

import type { IRoute } from './route';

@injectable()
export class HealthRoute implements IRoute {
  // IoC Key
  static readonly Key = Symbol.for('HealthRoute');

  // Dependencies
  constructor() {}

  // Register routes
  registerRoutes(app: OpenAPIHono<IGlobalContext>): void {
    // Health check
    this.healthCheck(app);
  }

  /**
   * Health check
   */
  private healthCheck(app: OpenAPIHono<IGlobalContext>) {
    // Create route definition
    const healthCheckRoute = createRoute({
      tags: ['health'],
      method: 'get',
      path: '/health',
      summary: 'Health check',
      description: 'API endpoint for health check',
      responses: {
        200: OpenApiResponseFactory.jsonSuccess('Health check successful'),
        500: OpenApiResponseFactory.jsonInternalServerError('Internal server error'),
      },
    });

    // Implementation
    app.openapi(healthCheckRoute, (c) => {
      // Send response
      const responseDto = ResponseDtoFactory.createSuccessResponseDto('Health check successful');
      return c.json(responseDto, 200);
    });
  }
}
