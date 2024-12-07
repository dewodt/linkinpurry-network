import { SuccessCursorPaginationResponse, SuccessResponse } from '@/types/api/common';

import { AxiosErrorResponse, DifferentSuccessCursorPaginationResponse } from './common';

/**
 * Base
 */
export interface FeedWithoutCreator {
  feed_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface FeedWithCreator {
  feed_id: string;
  user_id: string;
  username: string;
  full_name: string;
  profile_photo: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create new feed
 */
// Request
export interface CreateFeedRequestBody {
  content: string;
}

// Response
export type CreateFeedSuccessResponse = SuccessResponse<null>;

export type CreateFeedErrorResponse = AxiosErrorResponse;

/**
 * Get feed timeline
 */
// Request
export interface GetFeedTimelineRequestQuery {
  cursor: string | undefined;
  limit: number;
}

// Response
export interface GetFeedTimelineResponseBody {
  cursor: string | null;
  data: FeedWithCreator[];
}

export type GetFeedTimelineSuccessResponse = DifferentSuccessCursorPaginationResponse<GetFeedTimelineResponseBody>;

export type GetFeedTimelineErrorResponse = AxiosErrorResponse;

/**
 * Get feed detail
 */
// Request
export interface GetFeedDetailRequestParams {
  feedId: string;
}

// Response
export type GetFeedDetailSuccessResponse = SuccessResponse<FeedWithCreator>;

export type GetFeedDetailErrorResponse = AxiosErrorResponse;

/**
 * Get my feeds
 */
// Request
export interface GetMyFeedRequestQuery {
  cursor: string | undefined;
  limit: number;
}

// Response
export type GetMyFeedSuccessResponse = SuccessCursorPaginationResponse<FeedWithoutCreator>;

export type GetMyFeedErrorResponse = AxiosErrorResponse;

/**
 * Update feed
 */
// Request
export interface UpdateFeedRequestParams {
  feedId: string;
}

export interface UpdateFeedRequestBody {
  content: string;
}

// Response
export type UpdateFeedSuccessResponse = SuccessResponse<null>;

export type UpdateFeedErrorResponse = AxiosErrorResponse;

/**
 * Delete feed
 */
// Request
export interface DeleteFeedRequestParams {
  feedId: string;
}

// Response
export type DeleteFeedSuccessResponse = SuccessResponse<null>;

export type DeleteFeedErrorResponse = AxiosErrorResponse;
