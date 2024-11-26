import { AxiosErrorResponse, SuccessResponse } from './common';

/**
 * List Connection
 */
// Request
export interface ListConnectionRequestParams {
  userId: string;
}

// Response
export interface ListConnectionResponseBody {
  connections: {
    userID: string; // ID of the connected user
    username: string;
    name: string;
    profile_photo: string;
    is_connected: boolean;
    work_history: string | null;
    skills: string | null;
  }[];
}

export type ListConnectionSuccessResponse = SuccessResponse<ListConnectionResponseBody>;

export type ListConnectionErrorResponse = AxiosErrorResponse;
