import { AxiosErrorResponse, SuccessResponse } from './common';

/**
 * List Connection
 */
// Params
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
/**
 * List of Requested Connection
 */
// Params
export interface ConnectionRequestParams {
  requestId: string;
}

// Response
export interface ConnectionRequestResponseBody {
  requestsList: {
    userId: string;
    requestId: string;
    username: string;
    name: string;
    profile_photo: string;
    is_connected: boolean;
    work_history: string | null;
    skills: string | null;
  }[];
}

export type ConnectionRequestSuccessResponse = SuccessResponse<ConnectionRequestResponseBody>;

export type ConnectionRequestErrorResponse = AxiosErrorResponse;
