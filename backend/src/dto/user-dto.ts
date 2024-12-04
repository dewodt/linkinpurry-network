import { z } from '@hono/zod-openapi';

import { AVATAR_MAX_SIZE } from '@/utils/constants';
import { ConnectionStatus } from '@/utils/enum';
import { Utils } from '@/utils/utils';

/**
 * R
 * Get users list DTO
 */
// Request
export const getUsersRequestQueryDto = z
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

export type IGetUsersRequestQueryDto = z.infer<typeof getUsersRequestQueryDto>;

// Response
export const getUsersResponseBodyDto = z.array(
  z.object({
    id: z.string().openapi({
      description: 'ID of the user',
      example: '1234567890',
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
    connection_status: z
      .enum([ConnectionStatus.ACCEPTED, ConnectionStatus.PENDING, ConnectionStatus.NONE])
      .openapi({
        description: 'Status of the connection',
        example: ConnectionStatus.ACCEPTED,
      }),
  })
);

export type IGetUsersResponseBodyDto = z.infer<typeof getUsersResponseBodyDto>;

/**
 * R
 * Get user profile DTO
 * 2 case based on auth:
 * - User is not authenticated
 *    - fullName,
 *    - avatar,
 *    - connection_count
 *    - workHistory
 *    - skills
 * - (Other user) is authenticated but not connected to the user
 *    - (same as previous)
 *    - relevant post
 * - (Other user) is authenticated and connected to the user
 *    - (same as previous)
 * - (Current user) is authenticated and connected to the user
 *    - (same as previous)
 */

// Request
export const userIdRequestParamsDto = z.object({
  // cannot use coerce + bigint in zod + openapi, must manually transform + refine
  userId: z
    .string({ message: 'userId must be type of string' })
    .refine(
      (v) => {
        const { result, isValid } = Utils.parseBigIntId(v);
        return isValid && result > 0;
      },
      { message: 'userId must be type of big int and greater than 0' }
    )
    .transform((v) => BigInt(v))
    // @ts-ignore
    .openapi({
      type: 'bigint',
      param: {
        name: 'userId',
        in: 'path',
        required: true,
        description: 'User ID to get the profile',
        example: '7',
      },
    }),
});

export interface IGetProfileRequestParamsDto extends z.infer<typeof userIdRequestParamsDto> {}

// Response
export const getProfileResponseBodyDto = z.object({
  // level 1
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
  connection_count: z.number().openapi({
    description: 'Number of connections the user has',
    example: 10,
  }),
  work_history: z
    .string()
    .nullable() // no work history (null)
    .openapi({
      description: 'Work history of the user',
      example: 'Ex-Software Engineer @ Google, AWS, Microsoft',
    }),
  skills: z
    .string()
    .nullable() // no skills (null)
    .openapi({
      description: 'Skills of the user',
      example: 'Ex-Software Engineer @ Google, AWS, Microsoft',
    }),
  connection_status: z
    .enum([ConnectionStatus.ACCEPTED, ConnectionStatus.PENDING, ConnectionStatus.NONE])
    .openapi({
      description: 'Status of the connection',
      example: ConnectionStatus.ACCEPTED,
    }),

  // level 2
  relevant_posts: z
    .array(
      z.object({
        id: z.string(), // cannot serialize bigint, must convert manually in fe
        created_at: z.date(),
        content: z.string(),
      })
    )
    .optional() // not authorized to see
    .openapi({
      description: 'Relevant posts of the user',
      example: [
        {
          id: '1',
          created_at: new Date('2021-09-01T00:00:00.000Z'),
          content: 'Hello, world! 1',
        },
        {
          id: '2',
          created_at: new Date('2021-09-02T00:00:00.000Z'),
          content: 'Hello, world! 2',
        },
        {
          id: '3',
          created_at: new Date('2021-09-03T00:00:00.000Z'),
          content: 'Hello, world! 3',
        },
      ],
    }),
});

export interface IGetProfileResponseBodyDto extends z.infer<typeof getProfileResponseBodyDto> {}

/**
 * U
 * Update user DTO
 */
// Request
export const updateProfileRequestBodyDto = z.object({
  // TODO: Email changable or no?
  username: z
    .string({ message: 'Username is required' })
    .min(1, { message: 'Username is required' })
    .max(255, { message: 'Username maximum length is 255' })
    .regex(new RegExp('^[a-z0-9_]*$'), {
      message: 'Username must contain only lower case letters, numbers, and underscores',
    })
    .openapi({
      description: 'Username of the user',
      example: 'dewodt',
    }),
  name: z
    .string({ message: 'Name is required' })
    .min(1, { message: 'Name is required' })
    .max(255, { message: 'Name maximum length is 255' })
    .openapi({
      description: 'Name of the user',
      example: 'John Doe',
    }),
  profile_photo: z
    .custom<File>()
    .optional()
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
      'File type must be jpeg, png, or jpg'
    )
    .refine((file) => !file || file.size <= AVATAR_MAX_SIZE, 'File size must be less than 5MB')
    .openapi({
      description: 'Profile photo of the user',
      example: new File([], 'my-pict.jpg', { type: 'image/jpeg' }),
    }),
  work_history: z.string({ message: 'Work history must be a string' }).trim().optional().openapi({
    description: 'Work history of the user',
    example: 'Ex-Software Engineer @ Google, AWS, Microsoft',
  }),
  skills: z.string({ message: 'Skills must be a string' }).trim().optional().openapi({
    description: 'Skills of the user',
    example: 'Ex-Software Engineer @ Google, AWS, Microsoft',
  }),
});

export interface IUpdateProfileRequestBodyDto extends z.infer<typeof updateProfileRequestBodyDto> {}

// Response
// only need to return new profile photo if updated
export const updateProfileResponseBodyDto = z.object({
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
      description: 'Work history of the user (in rich text)',
      example: 'Ex-Software Engineer @ Google, AWS, Microsoft',
    }),
  skills: z
    .string()
    .nullable() // no skills (null)
    .openapi({
      description: 'Skills of the user',
      example: 'Ex-Software Engineer @ Google, AWS, Microsoft',
    }),
});

export type IUpdateProfileResponseBodyDto = z.infer<typeof updateProfileResponseBodyDto>;
