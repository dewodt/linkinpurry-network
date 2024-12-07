import { api } from '@/lib/api';
import {
  CreateFeedRequestBody,
  CreateFeedSuccessResponse,
  DeleteFeedRequestParams,
  DeleteFeedSuccessResponse,
  GetFeedDetailRequestParams,
  GetFeedDetailSuccessResponse,
  GetFeedTimelineRequestQuery,
  GetFeedTimelineSuccessResponse,
  GetMyFeedsSuccessResponse,
  UpdateFeedRequestBody,
  UpdateFeedRequestParams,
  UpdateFeedSuccessResponse,
} from '@/types/api/feed';

/**
 * Create feed
 */
export async function createFeed(body: CreateFeedRequestBody) {
  const axiosResponse = await api.post<CreateFeedSuccessResponse>('/api/feed', body);
  return axiosResponse.data;
}

/**
 * Get feeds timeline
 */
export async function getFeedTimeline(query: GetFeedTimelineRequestQuery) {
  const axiosResponse = await api.get<GetFeedTimelineSuccessResponse>('/api/feed', { params: query });
  return axiosResponse.data;
}

/**
 * Get my feeds
 */
export async function getMyFeeds(query: GetFeedTimelineRequestQuery) {
  const axiosResponse = await api.get<GetMyFeedsSuccessResponse>('/api/my-feed', { params: query });
  return axiosResponse.data;
}

/**
 * Get feed detail
 */
export async function getFeedDetail(params: GetFeedDetailRequestParams) {
  const axiosResponse = await api.get<GetFeedDetailSuccessResponse>(`/api/feed/${params.feedId}`);
  return axiosResponse.data;
}

/**
 * Update feed
 */
export async function updateFeed(params: UpdateFeedRequestParams, body: UpdateFeedRequestBody) {
  const axiosResponse = await api.put<UpdateFeedSuccessResponse>(`/api/feed/${params.feedId}`, body);
  return axiosResponse.data;
}

/**
 * Delete feed
 */
export async function deleteFeed(params: DeleteFeedRequestParams) {
  const axiosResponse = await api.delete<DeleteFeedSuccessResponse>(`/api/feed/${params.feedId}`);
  return axiosResponse.data;
}
