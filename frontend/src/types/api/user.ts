import { z } from 'zod';

import { ConnectionStatus } from '@/lib/enum';
import { getUsersRequestQuery } from '@/lib/schemas/user';

import { AxiosErrorResponse, SuccessPagePaginationResponse, SuccessResponse } from './common';

/**
 * Get users
 */
export type GetUsersRequestQuery = z.infer<typeof getUsersRequestQuery>;

export type GetUsersSuccessResponse = SuccessPagePaginationResponse<{
  id: string;
  username: string;
  name: string;
  profile_photo: string;
  connection_status: ConnectionStatus;
}>;

export type GetUsersErrorResponse = AxiosErrorResponse;

/**
 * Get profile
 */
// Request
export interface GetProfileRequestParams {
  userId: string;
}

// Response
export interface GetProfileResponseBody {
  username: string;
  name: string;
  profile_photo: string;
  connection_count: number;
  connection_status: ConnectionStatus;
  work_history: string | null;
  skills: string | null;
  relevant_posts?: {
    id: string;
    content: string;
    created_at: string;
  }[];
}

export type GetProfileSuccessResponse = SuccessResponse<GetProfileResponseBody>;

export type GetProfileErrorResponse = AxiosErrorResponse;

/**
 * Update profile
 */
// Request
export interface UpdateProfileRequestParams {
  userId: string;
}

export interface UpdateProfileRequestBody {
  username: string;
  name: string;
  profile_photo: File | undefined;
  work_history: string | undefined;
  skills: string | undefined;
}

// Response
export interface UpdateProfileResponseBody {
  username: string;
  name: string;
  profile_photo: string;
  work_history: string | null;
  skills: string | null;
}

export type UpdateProfileSuccessResponse = SuccessResponse<UpdateProfileResponseBody>;

export type UpdateProfileErrorResponse = AxiosErrorResponse;
