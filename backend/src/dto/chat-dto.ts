import { z } from '@hono/zod-openapi';

import { Utils } from '@/utils/utils';

// /**
//  * Cursor schema for chat (uses timestamp + id for the cursor)
//  */
// export const ChatCursorSchema = z.object({
//   id: z
//     .string({ message: 'ID must be in string format' })
//     .refine(
//       (v) => {
//         // Validate bigint
//         const { isValid } = Utils.parseBigIntId(v);
//         return isValid;
//       },
//       { message: 'userId must be type of big int and greater than 0' }
//     )
//     .transform((val) => BigInt(val)), // Convert string to BigInt
//   timestamp: z
//     .string({ message: 'timestamp must be in string format' })
//     .refine(
//       (v) => {
//         // Validate date
//         const date = new Date(v);
//         return !isNaN(date.getTime());
//       },
//       { message: 'timestamp must be in ISO string format' }
//     )
//     .transform((val) => new Date(val)), // Convert ISO string to Date
// });

// export interface IChatCursor extends z.infer<typeof ChatCursorSchema> {}

// /**
//  * Base64 cursor schema for chat
//  */
// const base64ChatCursorSchema = z
//   .string({ message: 'Cursor must be a base64 string' })
//   .refine(
//     (str) => {
//       try {
//         // Check if it's valid base64
//         return Buffer.from(str, 'base64').toString('base64') === str;
//       } catch {
//         return false;
//       }
//     },
//     { message: 'Invalid base64 string' }
//   )
//   .transform((base64Str) => {
//     try {
//       // Decode and parse the JSON
//       const decoded = JSON.parse(Buffer.from(base64Str, 'base64').toString());
//       // Validate against cursor schema
//       return ChatCursorSchema.parse(decoded);
//     } catch {
//       throw new Error('Invalid cursor format');
//     }
//   });

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
  withUserId: z
    .string({ message: 'withUserId must be type of string' })
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
        name: 'withUserId',
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
    .refine((v) => Utils.parseBigIntId(v).isValid, { message: 'cursor must be a string, bigint' })
    .transform((val) => BigInt(val))
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

export interface IGetChatHistoryRequestQueryDto
  extends z.infer<typeof getChatHistoryRequestQueryDto> {}

// Response
export const getChatHistoryResponseBodyDto = z.array(
  z.object({
    message: z.string().openapi({
      description: 'Message of the chat',
      example: 'Hello, world! 1',
    }),
    created_at: z.string().openapi({
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
