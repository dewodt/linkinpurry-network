import { z } from '@hono/zod-openapi';

import { AVATAR_MAX_SIZE } from '@/utils/constants';

/**
 * R
 * Get users list DTO
 */
// Request
// Response

/**
 * R
 * Get user profile DTO
 * 4 case based on auth:
 * - User is not authenticated
 *    - fullName,
 *    - avatar,
 *    - deskripsi singkat (DEPRECATED)
 *    - jumlah orang yang terkoneksi
 * - (Other user) is authenticated but not connected to the user
 *    - (same as previous) +
 *    - workHistory
 * - (Other user) is authenticated and connected to the user
 *    - (same as previous) +
 *    - skills
 *    - relevant posts
 * - (Current user) is authenticated and connected to the user
 *    - (same as previous) +
 *    - crud email, profile photo, workHistory, skill,
 */
// Request
export const getProfileRequestParamsDto = z.object({
  userId: z.coerce.bigint({ message: 'userId must be type of big int' }).openapi({
    description: 'User ID',
    example: 1n,
  }),
});

// Response
export const getProfileResponseBodyDto = z.object({
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
  //
  work_history: z
    .string()
    .openapi({
      description: 'Work history of the user (in rich text)',
      example: `
      <ul>
        <li>Frontend Developer at Company A</li>
        <li>Backend Developer at Company B</li>
      </ul>
    `,
    })
    .optional(), // optional depending on authorization
  //
  skills: z
    .string()
    .openapi({
      description: 'Skills of the user (rich text)',
      example: 'JavaScript, TypeScript, Node.js',
    })
    .optional(), // optional depending on authorization,
  // TODO: ADD FEE DTO SCHEMA
  relevant_posts: z
    .array(
      z.object({
        id: z.coerce.bigint().openapi({
          description: 'Post ID',
          example: 1n,
        }),
        createdAt: z.date().openapi({
          description: 'Post created date',
          example: '2021-09-01T00:00:00.000Z',
        }),
        content: z.string().openapi({
          description: 'Post content',
          example: 'Hello, world!',
        }),
      })
    )
    .optional() // optional depending on authorization
    .openapi({
      description: 'Relevant posts of the user',
      example: [
        {
          id: 1n,
          createdAt: new Date('2021-09-01T00:00:00.000Z'),
          content: 'Hello, world! 1',
        },
        {
          id: 2n,
          createdAt: new Date('2021-09-02T00:00:00.000Z'),
          content: 'Hello, world! 2',
        },
        {
          id: 3n,
          createdAt: new Date('2021-09-03T00:00:00.000Z'),
          content: 'Hello, world! 3',
        },
      ],
    }),
});

/**
 * U
 * Update user DTO
 */
// Request
export const updateProfileRequestBodyDto = z.object({
  // TODO: Email changable or no?
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
  work_history: z
    .string({ message: 'Work history must be a string' })
    .optional()
    .openapi({
      description: 'Work history of the user (in rich text)',
      example: `
        <ul>
          <li>Frontend Developer at Company A</li>
          <li>Backend Developer at Company B</li>
        </ul>
      `,
    }),
  skills: z.string({ message: 'Skills must be a string' }).optional().openapi({
    description: 'Skills of the user (rich text)',
    example: 'JavaScript, TypeScript, Node.js',
  }),
});

export interface IUpdateProfileRequestBodyDto extends z.infer<typeof updateProfileRequestBodyDto> {}

// Response
export const updateUserResponseBodyDto = z.literal(null);

export type IUpdateUserResponseBodyDto = z.infer<typeof updateUserResponseBodyDto>;
