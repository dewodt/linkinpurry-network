import { z } from 'zod';

import { loginRequestBody, registerRequestBody } from '@/lib/schemas/auth';

import { AxiosErrorResponse, SuccessResponse } from './common';

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
export type RegisterRequestBody = z.infer<typeof registerRequestBody>;

export interface RegisterResponseBody {
  token: string;
}

export type RegisterSuccessResponse = SuccessResponse<RegisterResponseBody>;

export type RegisterErrorResponse = AxiosErrorResponse;
