import { z } from '@hono/zod-openapi';

import { UserStatus } from '@/utils/enum';
import { Utils } from '@/utils/utils';

/**
 *
 * REST API
 *
 */

/**
 * Get Chat Inbox
 */
// Request query
export const getChatInboxRequestQueryDto = z.object({
  search: z.string({ message: 'search must be a string' }).optional().openapi({
    description: 'Search query for filtering chats',
    example: 'John Doe',
  }),
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
    }), // Convert string to BigInt
  limit: z
    .string({ message: 'limit must be a string' })
    .optional()
    .transform((val) => Utils.parseLimitPagination({ limit: val }))
    .openapi({
      description: 'Limit for pagination',
      example: '15',
    }),
});

export interface IGetChatInboxRequestQueryDto extends z.infer<typeof getChatInboxRequestQueryDto> {}

// Response
export const getChatInboxResponseBodyDto = z.array(
  z.object({
    other_user_id: z.string().openapi({
      description: 'ID pf the connected user',
      example: '67890',
    }),
    other_user_username: z.string().openapi({
      description: 'Username of the user',
      example: 'dewodt',
    }),
    other_user_full_name: z.string().openapi({
      description: 'Full name of the user',
      example: 'John Doe',
    }),
    other_user_profile_photo_path: z.string().openapi({
      description: 'Profile photo of the user',
      example: 'https://example.com/my-pict.jpg',
    }),
    latest_message_id: z.string().openapi({
      description: 'ID of the latest message',
      example: '1',
    }),
    latest_message_timestamp: z.string().openapi({
      description: 'Timestamp of the latest message',
      example: '2021-09-01T00:00:00.000Z',
    }),
    latest_message: z.string().openapi({
      description: 'Latest message of the user',
      example: 'Hello, world! 1',
    }),
  })
);

export interface IGetChatInboxResponseBodyDto extends z.infer<typeof getChatInboxResponseBodyDto> {}

/**
 * Request dto for getting chat history
 */

// Request params
export const getChatHistoryRequestParamsDto = z.object({
  otherUserId: z
    .string({ message: 'otherUserId must be type of string' })
    .refine(
      (v) => {
        // Validate bigint
        const { isValid } = Utils.parseBigIntId(v);
        return isValid;
      },
      { message: 'withUserId must be type of big int and greater than 0' }
    )
    .transform((v) => BigInt(v))
    // @ts-ignore
    .openapi({
      type: 'bigint',
      param: {
        name: 'otherUserId',
        in: 'path',
        required: true,
        description: 'User ID to get the profile',
        example: '7',
      },
    }),
});

export interface IGetChatHistoryRequestParamsDto
  extends z.infer<typeof getChatHistoryRequestParamsDto> {}

// Request query
export const getChatHistoryRequestQueryDto = z.object({
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
    }), // Convert string to BigInt
  limit: z
    .string({ message: 'limit must be a string' })
    .optional()
    .transform((val) => Utils.parseLimitPagination({ limit: val }))
    .openapi({
      description: 'Limit for pagination',
      example: '15',
    }),
});

export interface IGetChatHistoryRequestQueryDto
  extends z.infer<typeof getChatHistoryRequestQueryDto> {}

// Response
export const getChatHistoryResponseBodyDto = z.array(
  z.object({
    chat_id: z.string().openapi({
      description: 'ID of the chat',
      example: '1',
    }),
    message: z.string().openapi({
      description: 'Message of the chat',
      example: 'Hello, world! 1',
    }),
    timestamp: z.string().openapi({
      description: 'Timestamp of the message',
      example: '2021-09-01T00:00:00.000Z',
    }),
    from_user_id: z.string().openapi({
      description: 'ID of the user who sent the message',
      example: '1',
    }),
  })
);

export interface IGetChatHistoryResponseBodyDto
  extends z.infer<typeof getChatHistoryResponseBodyDto> {}

/**
 *
 * WEBSOCKET
 *
 */

/**
 * Join chat rooms requestdto
 */
// Request
export const joinChatRoomsRequestDataDto = z.object({
  user_ids: z
    .array(z.string({ message: 'must be an array of strings (bigint)' }))
    .refine((val) => val.length > 0 && val.every((v) => Utils.parseBigIntId(v).isValid), {
      message: 'must be an array of strings (bigint)',
    })
    .transform((val) => val.map((v) => BigInt(v))),
});

export interface IJoinChatRoomsRequestDataDto extends z.infer<typeof joinChatRoomsRequestDataDto> {}

/**
 * Get status request dto
 */
// Request
export const getStatusRequestDataDto = z.object({
  user_id: z
    .string({ message: 'must be a string (bigint)' })
    .refine((v) => Utils.parseBigIntId(v).isValid, {
      message: 'must be a string (bigint)',
    })
    .transform((v) => BigInt(v)),
});

export interface IGetStatusRequestDataDto extends z.infer<typeof getStatusRequestDataDto> {}

// Response
export const getStatusResponseDataDto = z.object({
  status: z.enum([UserStatus.ONLINE, UserStatus.OFFLINE], {
    message: 'must be a valid user status',
  }),
});

export interface IGetStatusResponseDataDto extends z.infer<typeof getStatusResponseDataDto> {}

/**
 * Send message request dto
 */
// Request
export const sendMessageRequestDataDto = z.object({
  to_user_id: z
    .string({ message: 'must be a string (bigint)' })
    .refine((v) => Utils.parseBigIntId(v).isValid, {
      message: 'must be a string (bigint)',
    })
    .transform((v) => BigInt(v)),
  message: z.string({ message: 'must be a string' }),
});

export interface ISendMessageRequestDataDto extends z.infer<typeof sendMessageRequestDataDto> {}

// Response
export const sendMessageResponseDataDto = z.object({
  other_user_id: z.string({ message: 'must be a string (bigint)' }),
  other_user_username: z.string({ message: 'must be a string' }),
  other_user_full_name: z.string({ message: 'must be a string' }),
  other_user_profile_photo_path: z.string({ message: 'must be a string' }),
  message: z.string({ message: 'must be a string' }),
  timestamp: z.string({ message: 'must be a string (ISO string)' }),
});

export interface ISendMessageResponseDataDto extends z.infer<typeof sendMessageResponseDataDto> {}

/**
 * Send typing request data
 */
// Request
export const sendTypingRequestDataDto = z.object({
  to_user_id: z
    .string({ message: 'must be a string (bigint)' })
    .refine((val) => Utils.parseBigIntId(val), { message: 'must be a string (bigint)' })
    .transform((val) => BigInt(val)),
});

export interface ISendTypingRequestDataDto extends z.infer<typeof sendTypingRequestDataDto> {}

// Response
export const sendTypingResponseDataDto = z.object({
  from_user_id: z.string({ message: 'must be a string (bigint)' }),
});

export interface ISendTypingResponseDataDto extends z.infer<typeof sendTypingResponseDataDto> {}

/**
 * Send stop typing request data
 */
// Request
export const sendStopTypingRequestDataDto = z.object({
  to_user_id: z
    .string({ message: 'must be a string (bigint)' })
    .refine((val) => Utils.parseBigIntId(val), { message: 'must be a string (bigint)' })
    .transform((val) => BigInt(val)),
});

export interface ISendStopTypingRequestDataDto
  extends z.infer<typeof sendStopTypingRequestDataDto> {}

// Response
export const sendStopTypingResponseDataDto = z.object({
  from_user_id: z.string({ message: 'must be a string (bigint)' }),
});

export interface ISendStopTypingResponseDataDto
  extends z.infer<typeof sendStopTypingResponseDataDto> {}
