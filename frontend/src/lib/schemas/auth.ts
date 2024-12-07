import { z } from 'zod';

/**
 * Login Request body
 */
export const loginRequestBody = z.object({
  identifier: z.string({ message: 'Identifier is required' }).min(1, { message: 'Identifier is required' }),
  password: z.string({ message: 'Password is required' }).min(1, { message: 'Password is required' }),
});

/**
 * Register Request body
 */
export const registerRequestBody = z
  .object({
    username: z
      .string({ message: 'Username is required' }) // handle null or undefined
      .min(1, { message: 'Username is required' }) // handle empty string
      .max(255, { message: 'Username maximum length is 255' })
      .regex(new RegExp('^[a-z0-9_]*$'), {
        message: 'Username must contain only lower case letters, numbers, and underscores',
      }),
    email: z
      .string({ message: 'Email is required' }) // handle null or undefined
      .email({ message: 'Email is invalid' })
      .min(1, { message: 'Email is required' }) // handle empty string
      .max(255, { message: 'Email maximum length is 255' }),
    name: z
      .string({ message: 'Name is required' }) // handle null or undefined
      .min(1, { message: 'Name is required' })
      .max(255, { message: 'Name maximum length is 255' }), // handle empty string
    password: z
      .string({ message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(20, { message: 'Password must be at most 20 characters long' })
      .regex(new RegExp('^(?=.*[a-z])'), {
        message: 'Password must contain a lowercase',
      })
      .regex(new RegExp('^(?=.*[A-Z])'), {
        message: 'Password must contain an uppercase',
      })
      .regex(new RegExp('^(?=.*[0-9])'), {
        message: 'Password must contain a number',
      })
      .regex(new RegExp('^(?=.*[!@#$%^&*])'), {
        message: 'Password must contain a special character',
      }),

    confirmPassword: z.string({ message: 'Confirm password is required' }).min(1, { message: 'Confirm password is required' }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      return ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });
