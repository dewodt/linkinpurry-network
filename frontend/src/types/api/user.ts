import { AxiosErrorResponse, SuccessResponse } from './common';

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
  is_connected: boolean;
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
