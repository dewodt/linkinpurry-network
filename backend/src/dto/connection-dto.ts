import { z } from '@hono/zod-openapi';

import { ConnectionRequestDecision, ConnectionStatus } from '@/utils/enum';
import { Utils } from '@/utils/utils';

/**
 * C
 * Create request connection DTO
 */
// Request
export const CreateConnectionReqRequestBodyDto = z.object({
  toUserId: z
    .string({ message: 'toUserId must be type of string' })
    .refine((v) => Utils.parseBigIntId(v).isValid, {
      message: 'toUserId must be type of big int and greater than 0',
    })
    .transform((v) => BigInt(v))
    // @ts-ignore
    .openapi({
      type: 'bigint',
      param: {
        name: 'userId',
        in: 'path',
        required: true,
        description: 'User ID to request connection',
        example: '7',
      },
    }),
});

export interface ICreateConnectionReqRequestBodyDto
  extends z.infer<typeof CreateConnectionReqRequestBodyDto> {}

// Response
export const CreateConnectionReqResponseBodyDto = z.object({
  finalState: z.enum([ConnectionStatus.PENDING, ConnectionStatus.ACCEPTED]).openapi({
    description:
      'Final state of the connection request. Accepted if the other user already sent a request to the user, and pending if not.',
    example: ConnectionStatus.PENDING,
  }),
});

export interface ICreateConnectionReqResponseBodyDto
  extends z.infer<typeof CreateConnectionReqResponseBodyDto> {}

/**
 * List Connections DTO
 */
// Request Params
export const GetConnectionListRequestParamsDto = z.object({
  userId: z
    .string({ message: 'userId must be type of string' })
    .refine((v) => Utils.parseBigIntId(v).isValid, {
      message: 'userId must be type of big int and greater than 0',
    })
    .transform((v) => BigInt(v))
    // @ts-ignore
    .openapi({
      type: 'bigint',
      param: {
        name: 'userId',
        in: 'path',
        required: true,
        description: 'User ID to get the profile',
        example: 1,
      },
    }),
});

export interface IGetConnectionListRequestParamsDto
  extends z.infer<typeof GetConnectionListRequestParamsDto> {}

// Enhancement: Create using pagination also
// Request query
export const GetConnectionListRequestQueryDto = z
  .object({
    search: z.string({ message: 'search must be type of string' }).optional().openapi({
      description: 'Search query for filtering connections',
      example: 'John Doe',
    }),
    page: z.string({ message: 'page must be type of string' }).optional().openapi({
      description: 'Page number for pagination',
      example: '1',
    }),
    limit: z.string({ message: 'limit must be type of string' }).optional().openapi({
      description: 'Limit for pagination',
      example: '15',
    }),
  })
  .transform(({ page, limit, search }) => ({
    search,
    ...Utils.parsePagePagination({ page, limit }),
  }));

export interface IGetConnectionListRequestQueryDto
  extends z.infer<typeof GetConnectionListRequestQueryDto> {}

// Response
export const GetConnectionListResponseBodyDto = z
  .array(
    z.object({
      user_id: z.string().openapi({
        description: 'ID pf the connected user',
        example: '67890',
      }),
      username: z.string().openapi({
        description: 'Username of the user',
        example: 'dewodt',
      }),
      name: z.string().openapi({
        description: 'Name of the user',
        example: 'John Doe',
      }),
      profile_photo: z.string().openapi({
        description: 'Profile photo of the user',
        example: 'https://example.com/my-pict.jpg',
      }),
      work_history: z
        .string()
        .nullable() // no work history (null)
        .openapi({
          description: 'Work history of the user',
          example: 'Ex-Software Engineer @ Google, AWS, Microsoft',
        }),
      connection_status: z
        .enum([ConnectionStatus.ACCEPTED, ConnectionStatus.PENDING, ConnectionStatus.NONE])
        .openapi({
          description: 'Status of the connection',
          example: ConnectionStatus.ACCEPTED,
        }),
    })
  )
  .openapi({
    description: 'List of connections',
  });

export interface IGetConnectionListResponseBodyDto
  extends z.infer<typeof GetConnectionListResponseBodyDto> {}

/**
 * Get pending connection requests DTO
 */
// Request query  (pagination)
export const GetPendingConnectionReqRequestQueryDto = z
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
  .transform(({ page, limit }) => Utils.parsePagePagination({ page, limit }));

// Response
export const GetPendingConnectionReqResponseBodyDto = z.array(
  z.object({
    user_id: z.string().openapi({
      description: 'ID pf the connected user',
      example: '67890',
    }),
    username: z.string().openapi({
      description: 'Username of the user',
      example: 'dewodt',
    }),
    name: z.string().openapi({
      description: 'Name of the user',
      example: 'John Doe',
    }),
    profile_photo: z.string().openapi({
      description: 'Profile photo of the user',
      example: 'https://example.com/my-pict.jpg',
    }),
    work_history: z
      .string()
      .nullable() // no work history (null)
      .openapi({
        description: 'Work history of the user',
        example: 'Ex-Software Engineer @ Google, AWS, Microsoft',
      }),
  })
);

export interface IGetPendingConnectionReqResponseBodyDto
  extends z.infer<typeof GetPendingConnectionReqResponseBodyDto> {}

/**
 * Decide Connections DTO
 */
// Request params
export const DecideConnectionReqRequestParamsDto = z.object({
  fromUserId: z
    .string({ message: 'fromUserId must be type of string' })
    .refine((v) => Utils.parseBigIntId(v).isValid, {
      message: 'userId must be type of big int and greater than 0',
    })
    .transform((v) => BigInt(v))
    // @ts-ignore
    .openapi({
      type: 'bigint',
      param: {
        name: 'fromUserId',
        in: 'path',
        required: true,
        description: 'User ID to get the profile',
        example: 1,
      },
    }),
});

export interface IDecideConnectionReqRequestParamsDto
  extends z.infer<typeof DecideConnectionReqRequestParamsDto> {}

// Request body
export const DecideConnectionReqRequestBodyDto = z.object({
  decision: z.enum([ConnectionRequestDecision.ACCEPT, ConnectionRequestDecision.DECLINE]).openapi({
    description: 'Decision to accept or reject the connection request',
    example: ConnectionRequestDecision.ACCEPT,
  }),
});

export interface IDecideConnectionReqRequestBodyDto
  extends z.infer<typeof DecideConnectionReqRequestBodyDto> {}

// Response
export const DecideConnectionReqResponseBodyDto = z.literal(null).openapi({
  description: 'Decide Connection Request Response',
});

export type IDecideConnectionReqResponseBodyDto = z.infer<
  typeof DecideConnectionReqResponseBodyDto
>;

/**
 * Unconnect DTO
 */
// Request params
export const UnconnectRequestParamsDto = z.object({
  toUserId: z
    .string({ message: 'toUserId must be type of string' })
    .refine((v) => Utils.parseBigIntId(v).isValid, {
      message: 'toUserId must be type of big int and greater than 0',
    })
    .transform((v) => BigInt(v))
    // @ts-ignore
    .openapi({
      type: 'bigint',
      param: {
        name: 'toUserId',
        in: 'path',
        required: true,
        description: 'User ID to get the profile',
        example: 1,
      },
    }),
});

export interface IUnconnectRequestParamsDto extends z.infer<typeof UnconnectRequestParamsDto> {}

// Response
export const UnconnectResponseBodyDto = z.literal(null).openapi({
  description: 'Unconnect Response',
});

export type IUnconnectResponseBodyDto = z.infer<typeof UnconnectResponseBodyDto>;
