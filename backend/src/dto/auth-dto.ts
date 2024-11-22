import type { JWTPayload } from 'hono/utils/jwt/types';
import * as z from 'zod';

/**
 * JWT Claim
 */
export interface CustomJWTPayload extends JWTPayload {
  userId: string;
  email: string;
}

/**
 * Login request DTO
 */
export const LoginRequestDto = z.object({
  identifier: z
    .string({ message: 'Identifier is required' }) // handle null or undefined
    .min(1, { message: 'Identifier is required' }), // handle empty string
  password: z
    .string({ message: 'Password is required' }) // handle null or undefined
    .min(1, { message: 'Password is required' }), // handle empty string
});

export interface ILoginRequestDto extends z.infer<typeof LoginRequestDto> {}

/**
 * Register request DTO
 */
export const RegisterRequestDto = z.object({
  username: z
    .string({ message: 'Username is required' }) // handle null or undefined
    .min(1, { message: 'Username is required' })
    .max(255, { message: 'Username maximum length is 255' }), // handle empty string
  email: z
    .string({ message: 'Email is required' }) // handle null or undefined
    .email({ message: 'Email is invalid' })
    .min(1, { message: 'Email is required' }) // handle empty string
    .max(255, { message: 'Email maximum length is 255' }),
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
    }),
});

export interface IRegisterRequestDto extends z.infer<typeof RegisterRequestDto> {}
