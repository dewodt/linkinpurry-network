/**
 * The query params for the getConnectionsRequest
 */
import { z } from 'zod';

export const getConnectionsRequestQuery = z.object({
  search: z.string().optional(),
  page: z.number().int().positive().optional().catch(1),
  limit: z.number().int().positive().optional().catch(10),
});

export const getConnectionReqsRequestQuery = z.object({
  page: z.number().int().positive().optional().catch(1),
  limit: z.number().int().positive().optional().catch(10),
});
