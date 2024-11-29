import { z } from 'zod';

/**
 * Update user schema
 */
export const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const updateProfileRequestBody = z.object({
  username: z
    .string({ message: 'Username is required' })
    .min(1, { message: 'Username is required' })
    .max(255, { message: 'Username maximum length is 255' })
    .regex(new RegExp('^[a-z0-9_]*$'), {
      message: 'Username must contain only lower case letters, numbers, and underscores',
    }),
  name: z.string({ message: 'Name is required' }).min(1, { message: 'Name is required' }).max(255, { message: 'Name maximum length is 255' }),
  profile_photo: z
    .custom<File>()
    .optional()
    .refine((file) => !file || ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type), 'File type must be jpeg, png, or jpg')
    .refine((file) => !file || file.size <= AVATAR_MAX_SIZE, 'File size must be less than 5MB'),
  work_history: z.string({ message: 'Work history must be a string' }).trim().optional(),
  skills: z.string({ message: 'Skills must be a string' }).trim().optional(),
});
