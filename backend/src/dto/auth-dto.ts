import { z } from '@hono/zod-openapi';
import { type JWTPayload as BaseJwtPayload } from 'hono/utils/jwt/types';

/**
 * JWT Claim (parsed payload)
 */
export interface JWTPayload extends BaseJwtPayload {
  userId: bigint;
  email: string;
}

export interface RawJWTPayload extends BaseJwtPayload {
  userId: string;
  email: string;
}

/**
 * Session DTO
 */
export const sessionResponseBodyDto = z.object({
  userId: z
    .string() // cannot serialize bigint, must convert manually in fe
    .openapi({
      description: 'User ID',
      example: '100',
    }),
  email: z.string().email().openapi({
    description: 'User email',
    example: 'dewodt@gmail.com',
  }),
  name: z.string().openapi({
    description: 'User full name',
    example: 'Dewantoro Triatmojo',
  }),
  profilePhoto: z.string().openapi({
    description: 'Profile photo path',
    example: 'https://example.com/photo.jpg',
  }),
});

export interface ISessionResponseBodyDto extends z.infer<typeof sessionResponseBodyDto> {}

/**
 * Login DTO
 */

// Request
export const loginRequestBodyDto = z.object({
  identifier: z
    .string({ message: 'Identifier is required' }) // handle null or undefined
    .min(1, { message: 'Identifier is required' })
    .openapi({
      description: 'Username or email',
      example: 'dewodt',
    }), // handle empty string
  password: z
    .string({ message: 'Password is required' }) // handle null or undefined
    .min(1, { message: 'Password is required' })
    .openapi({
      description: 'User password',
      example: 'P4ssword1!',
    }), // handle empty string
});

export interface ILoginRequestBodyDto extends z.infer<typeof loginRequestBodyDto> {}

// Response
export const loginResponseBodyDto = z.object({
  token: z.string().openapi({
    description: 'JWT token for authentication',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMCwiZW1haWwiOiJkZXdvZHRAY29tIn0.5V8X0rFmQ1xJ9u3G9WJfZ2Z0z9Zx7wJjv1NkF6v2w7A',
  }),
});

export interface ILoginResponseBodyDto extends z.infer<typeof loginResponseBodyDto> {}

/**
 * Register DTO
 */
// Request
export const registerRequestBodyDto = z.object({
  username: z
    .string({ message: 'Username is required' }) // handle null or undefined
    .min(1, { message: 'Username is required' }) // handle empty string
    .max(255, { message: 'Username maximum length is 255' })
    .regex(new RegExp('^[a-z0-9_]*$'), {
      message: 'Username must contain only lower case letters, numbers, and underscores',
    })
    .openapi({
      description: 'Username',
      example: 'dewodt',
    }),
  email: z
    .string({ message: 'Email is required' }) // handle null or undefined
    .email({ message: 'Email is invalid' })
    .min(1, { message: 'Email is required' }) // handle empty string
    .max(255, { message: 'Email maximum length is 255' })
    .openapi({
      description: 'Email',
      example: 'dewodt@gmail.com',
    }),
  name: z
    .string({ message: 'Name is required' }) // handle null or undefined
    .min(1, { message: 'Name is required' })
    .max(255, { message: 'Name maximum length is 255' }) // handle empty string
    .openapi({
      description: 'Name',
      example: 'Dewo',
    }),
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
    })
    .openapi({
      description: 'User password',
      example: 'P4ssword1!',
    }),
});

export interface IRegisterRequestBodyDto extends z.infer<typeof registerRequestBodyDto> {}

// Response
export const registerResponseBodyDto = z.object({
  token: z.string().openapi({
    description: 'JWT token for authentication',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMCwiZW1haWwiOiJkZXdvZHRAY29tIn0.5V8X0rFmQ1xJ9u3G9WJfZ2Z0z9Zx7wJjv1NkF6v2w7A',
  }),
});

export interface IRegisterResponseBodyDto extends z.infer<typeof registerResponseBodyDto> {}
