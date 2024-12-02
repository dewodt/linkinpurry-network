import { AxiosErrorResponse, SuccessCursorPaginationResponse } from './common';

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

/**
 * Get status
 */

/**
 * Send message
 */

/**
 * Send typing
 */

/**
 * Send stop typing
 */
