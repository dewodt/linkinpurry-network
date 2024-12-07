import { z } from '@hono/zod-openapi';

import { Utils } from '@/utils/utils';

/**
 * Get Feed timeline
 */
// request query
export const getFeedTimelineRequestQueryDto = z.object({
  cursor: z
    .string({ message: 'cursor must be a string, bigint' })
    .optional()
    .refine((v) => v === undefined || Utils.parseBigIntId(v).isValid, {
      message: 'cursor must be a string, bigint',
    })
    .transform((val) => (val !== undefined ? BigInt(val) : undefined))
    .openapi({
      description: 'Cursor for the next page',
      example: '1',
    }),
  limit: z
    .string({ message: 'limit must be a string' })
    .optional()
    .transform((val) => Utils.parseLimitPagination({ limit: val }))
    .openapi({
      description: 'Limit for pagination',
      example: '15',
    }),
});

export interface IGetFeedTimelineRequestQueryDto
  extends z.infer<typeof getFeedTimelineRequestQueryDto> {}

// response
export const getFeedTimelineResponseBodyDto = z.object({
  // added cursor here just do adjust to requirements. The FE will use the cursor from meta, not here.
  // sucks, makes the response inconsistent but oh well :)
  cursor: z.string().nullable().openapi({
    description: 'Cursor for the next page',
    example: '1',
  }),

  // actual data (paginated)
  data: z.array(
    z.object({
      feed_id: z.string().openapi({
        description: 'ID of the feed',
        example: '12345',
      }),
      user_id: z.string().openapi({
        description: 'ID of the user',
        example: '67890',
      }),
      username: z.string().openapi({
        description: 'Username of the user',
        example: 'dewodt',
      }),
      full_name: z.string().openapi({
        description: 'Full name of the user',
        example: 'John Doe',
      }),
      profile_photo_path: z.string().openapi({
        description: 'Profile photo of the user',
        example: 'https://example.com/image.jpg',
      }),
      content: z.string().openapi({
        description: 'Content of the post',
        example: 'Hello world!',
      }),
      created_at: z.string().openapi({
        description: 'Timestamp of the post',
        example: '2021-09-01T00:00:00.000Z',
      }),
    })
  ),
});

export interface IGetFeedTimelineResponseBodyDto
  extends z.infer<typeof getFeedTimelineResponseBodyDto> {}

/**
 * Get my feed (no api contract provided, create own.)
 */
// Request query
export const getMyFeedRequestQueryDto = z
  .object({
    page: z.string({ message: 'page must be type of string' }).optional().openapi({
      description: 'Page number for pagination',
      example: '1',
    }),
    limit: z.string({ message: 'limit must be type of string' }).optional().openapi({
      description: 'Limit for pagination',
      example: '15',
    }),
  })
  .transform(({ page, limit }) => ({
    ...Utils.parsePagePagination({ page, limit }),
  }));

export interface IGetMyFeedRequestQueryDto extends z.infer<typeof getMyFeedRequestQueryDto> {}

// Response
export const getMyFeedResponseBodyDto = z.array(
  z.object({
    feed_id: z.string().openapi({
      description: 'ID of the feed',
      example: '12345',
    }),
    content: z.string().openapi({
      description: 'Content of the post',
      example: 'Hello world!',
    }),
    created_at: z.string().openapi({
      description: 'Timestamp of the post',
      example: '2021-09-01T00:00:00.000Z',
    }),
  })
);

export interface IGetMyFeedResponseBodyDto extends z.infer<typeof getMyFeedResponseBodyDto> {}

/**
 * Create post
 */
// Request body
export const createFeedRequestBodyDto = z.object({
  content: z
    .string({ message: 'Content is required' }) // handle null or undefined
    .min(1, { message: 'Content is required' }) // handle empty string
    .max(280, { message: 'Content maximum length is 280 characters' })
    .openapi({
      description: 'Post content',
      example: 'Hello world!',
    }),
});

export interface ICreateFeedRequestBodyDto extends z.infer<typeof createFeedRequestBodyDto> {}

// Response
// No need response, invalidate the query

/**
 * Update post
 */
// Request params
export const updateFeedRequestParamsDto = z.object({
  feedId: z
    .string({ message: 'feedId must be type of string' })
    .refine((v) => Utils.parseBigIntId(v).isValid, {
      message: 'feedId must be type of big int and greater than 0',
    })
    .transform((v) => BigInt(v))
    // @ts-ignore
    .openapi({
      type: 'bigint',
      param: {
        name: 'feedId',
        in: 'path',
        required: true,
        description: 'ID of the feed',
        example: 1,
      },
    }),
});

export interface IUpdateFeedRequestParamsDto extends z.infer<typeof updateFeedRequestParamsDto> {}

// Request body
export const updateFeedRequestBodyDto = z.object({
  content: z
    .string({ message: 'Content is required' }) // handle null or undefined
    .min(1, { message: 'Content is required' }) // handle empty string
    .max(280, { message: 'Content maximum length is 280 characters' })
    .openapi({
      description: 'Feed content',
      example: 'Hello world!',
    }),
});

export interface IUpdateFeedRequestBodyDto extends z.infer<typeof updateFeedRequestBodyDto> {}

// Response
// No need response, invalidate the query

/**
 * Delete post
 */
// Request params
export const deleteFeedRequestParamsDto = z.object({
  feedId: z
    .string({ message: 'feedId must be type of string' })
    .refine((v) => Utils.parseBigIntId(v).isValid, {
      message: 'feedId must be type of big int and greater than 0',
    })
    .transform((v) => BigInt(v))
    // @ts-ignore
    .openapi({
      type: 'bigint',
      param: {
        name: 'feedId',
        in: 'path',
        required: true,
        description: 'ID of the feed',
        example: 1,
      },
    }),
});

export interface IDeleteFeedRequestParamsDto extends z.infer<typeof deleteFeedRequestParamsDto> {}

// Response
// No need response, invalidate the querys
