import { z } from '@hono/zod-openapi';
import { type JWTPayload as BaseJwtPayload } from 'hono/utils/jwt/types';

/**
 * JWT Claim
 */
export interface JWTPayload extends BaseJwtPayload {
  userId: bigint;
  email: string;
}

/**
 * Login DTO
 */

// Request
export const LoginRequestDto = z.object({
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

export interface ILoginRequestDto extends z.infer<typeof LoginRequestDto> {}

// Response
export const LoginResponseDto = z.object({
  token: z.string().openapi({
    description: 'JWT token for authentication',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMCwiZW1haWwiOiJkZXdvZHRAY29tIn0.5V8X0rFmQ1xJ9u3G9WJfZ2Z0z9Zx7wJjv1NkF6v2w7A',
  }),
});

export interface ILoginResponseDto extends z.infer<typeof LoginResponseDto> {}

/**
 * Register DTO
 */
// Request
export const RegisterRequestDto = z.object({
  username: z
    .string({ message: 'Username is required' }) // handle null or undefined
    .min(1, { message: 'Username is required' }) // handle empty string
    .max(255, { message: 'Username maximum length is 255' })
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
    .string({ message: 'Password must not be empty' })
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

export interface IRegisterRequestDto extends z.infer<typeof RegisterRequestDto> {}

// Response
export const RegisterResponseDto = z.object({
  token: z.string().openapi({
    description: 'JWT token for authentication',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMCwiZW1haWwiOiJkZXdvZHRAY29tIn0.5V8X0rFmQ1xJ9u3G9WJfZ2Z0z9Zx7wJjv1NkF6v2w7A',
  }),
});

export interface IRegisterResponseDto extends z.infer<typeof RegisterResponseDto> {}
