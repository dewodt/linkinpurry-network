import { UserStatus } from '@/lib/enum';

import { AxiosErrorResponse, SuccessCursorPaginationResponse, SuccessResponse } from './common';

/**
 *
 *
 *  REST API
 *
 *
 */

/**
 * Get chat inbox
 */
export interface GetChatInboxRequestQuery {
  search: string | undefined;
  cursor: string | undefined;
  limit: number | undefined;
}

export interface GetChatInboxResponseBody {
  other_user_id: string;
  other_user_username: string;
  other_user_full_name: string;
  other_user_profile_photo_path: string;
  latest_message_id: string;
  latest_message_timestamp: string;
  latest_message: string;
}

export type GetChatInboxSuccessResponse = SuccessCursorPaginationResponse<GetChatInboxResponseBody>;

export type GetChatInboxErrorResponse = AxiosErrorResponse;

/**
 * Get chat history
 */
export interface GetChatHistoryRequestParams {
  otherUserId: string;
}

export interface GetChatHistoryRequestQuery {
  cursor: string | undefined;
  limit: number | undefined;
}

export interface GetChatHistoryResponseBody {
  chat_id: string;
  from_user_id: string;
  timestamp: string;
  message: string;
}

export type GetChatHistorySuccessResponse = SuccessCursorPaginationResponse<GetChatHistoryResponseBody>;

export type GetChatHistoryErrorResponse = AxiosErrorResponse;

/**
 *
 *
 *  WEBSOCKET
 *
 *
 */

/**
 * Join chat rooms
 */
export interface JoinChatRoomsRequestData {
  user_ids: string[];
}

export type JoinChatRoomsSuccessResponse = SuccessResponse<null>;

export type JoinChatRoomsErrorResponse = AxiosErrorResponse;

/**
 * Get status
 */
export interface GetStatusRequestData {
  user_id: string;
}

export interface GetStatusResponseData {
  status: UserStatus;
}

export type GetStatusSuccessResponse = SuccessResponse<GetStatusResponseData>;

export type GetStatusErrorResponse = AxiosErrorResponse;

/**
 * Send message
 */
export interface SendMessageRequestData {
  to_user_id: string;
  message: string;
}

export interface SendMessageResponseData {
  other_user_id: string;
  other_user_username: string;
  other_user_full_name: string;
  other_user_profile_photo_path: string;
  message: string;
  timestamp: string;
}

export type SendMessageSuccessResponse = SuccessResponse<SendMessageResponseData>;

export type SendMessageErrorResponse = AxiosErrorResponse;

/**
 * Send typing
 */
export interface SendTypingRequestData {
  to_user_id: string;
}

export interface SendTypingResponseData {
  from_user_id: string;
}

export type SendTypingSuccessResponse = SuccessResponse<SendTypingResponseData>;

export type SendTypingErrorResponse = AxiosErrorResponse;

/**
 * Send stop typing
 */
export interface SendStopTypingRequestData {
  to_user_id: string;
}

export interface SendStopTypingResponseData {
  from_user_id: string;
}

export type SendStopTypingSuccessResponse = SuccessResponse<SendStopTypingResponseData>;

export type SendStopTypingErrorResponse = AxiosErrorResponse;
