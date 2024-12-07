import { z } from 'zod';

import { loginRequestBody, registerRequestBody } from '@/lib/schemas/auth';

import { Session } from '../models/session';
import { AxiosErrorResponse, SuccessResponse } from './common';

/**
 * Session
 */
export type SessionResponseBody = Session;

export type SessionSuccessResponse = SuccessResponse<SessionResponseBody>;

export type SessionErrorResponse = AxiosErrorResponse;

/**
 * Login
 */
export type LoginRequestBody = z.infer<typeof loginRequestBody>;

export interface LoginResponseBody {
  token: string;
}

export type LoginSuccessResponse = SuccessResponse<LoginResponseBody>;

export type LoginErrorResponse = AxiosErrorResponse;

/**
 * Register
 */

export type RegisterFormFields = z.infer<typeof registerRequestBody>;

export type RegisterRequestBody = Omit<RegisterFormFields, 'confirmPassword'>;

export interface RegisterResponseBody {
  token: string;
}

export type RegisterSuccessResponse = SuccessResponse<RegisterResponseBody>;

export type RegisterErrorResponse = AxiosErrorResponse;

/**
 * Logout
 */

export type LogoutSuccessResponse = SuccessResponse<null>;

export type LogoutErrorResponse = AxiosErrorResponse;
