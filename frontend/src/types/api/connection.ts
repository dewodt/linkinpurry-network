import { z } from 'zod';

import { ConnectionRequestDecision, ConnectionStatus } from '@/lib/enum';
import { getConnectionReqsRequestQuery, getConnectionsRequestQuery } from '@/lib/schemas/connection';

import { AxiosErrorResponse, SuccessPagePaginationResponse, SuccessResponse } from './common';

/**
 * Connect to a user
 */
export interface ConnectUserRequestBody {
  toUserId: string;
}

export interface ConnectUserResponseBody {
  finalState: ConnectionStatus.ACCEPTED | ConnectionStatus.PENDING;
}

export type ConnectUserSuccessResponse = SuccessResponse<ConnectUserResponseBody>;

export type ConnectUserErrorResponse = AxiosErrorResponse;

/**
 * Get connection lists
 */
export interface GetConnectionsRequestParams {
  userId: string;
}

export type GetConnectionsRequestQuery = z.infer<typeof getConnectionsRequestQuery>;

export interface GetConnectionsResponseBody {
  user_id: string;
  username: string;
  name: string;
  profile_photo: string;
  work_history: string | null;
  connection_status: ConnectionStatus;
}

export type GetConnectionsSuccessResponse = SuccessPagePaginationResponse<GetConnectionsResponseBody>;

export type GetConnectionsErrorResponse = AxiosErrorResponse;

/**
 * Get conneciton requests
 */
export type GetConnectionReqsRequestQuery = z.infer<typeof getConnectionReqsRequestQuery>;

export type GetConnectionReqsResponseBody = {
  user_id: string;
  username: string;
  name: string;
  profile_photo: string;
  work_history: string | null;
};

export type GetConnectionReqsSuccessResponse = SuccessPagePaginationResponse<GetConnectionReqsResponseBody>;

export type GetConnectionReqsErrorResponse = AxiosErrorResponse;

/**
 * Decide connection request
 */
export interface DecideConnectionReqRequestParams {
  fromUserId: string;
}

export interface DecideConnectionReqRequestBody {
  decision: ConnectionRequestDecision;
}

export type DecideConnectionReqSuccessResponse = SuccessResponse<null>;

export type DecideConnectionReqErrorResponse = AxiosErrorResponse;

/**
 * Unconnect to a user
 */
export interface UnConnectUserRequestParams {
  toUserId: string;
}

export type UnConnectUserSuccessResponse = SuccessResponse<null>;

export type UnConnectUserErrorResponse = AxiosErrorResponse;
