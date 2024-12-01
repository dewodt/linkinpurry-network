import { api } from '@/lib/api';
import {
  GetChatHistoryRequestParams,
  GetChatHistoryRequestQuery,
  GetChatHistorySuccessResponse,
  GetChatInboxRequestQuery,
  GetChatInboxSuccessResponse,
} from '@/types/api/chat';

/**
 *
 *
 *  REST API
 *
 *
 */

/**
 * Get chat inbox service
 */
export async function getChatInbox(query: GetChatInboxRequestQuery): Promise<GetChatInboxSuccessResponse> {
  // await new Promise((resolve) => setTimeout(resolve, 50000));
  // throw new Error('Not implemented');
  const axiosResponse = await api.get<GetChatInboxSuccessResponse>('/api/chat/inbox', { params: query });
  return axiosResponse.data;
}

/**
 * Get chat history service
 */
export async function getChatHistory(params: GetChatHistoryRequestParams, query: GetChatHistoryRequestQuery): Promise<GetChatHistorySuccessResponse> {
  const axiosResponse = await api.get<GetChatHistorySuccessResponse>(`/api/chat/${params.otherUserId}/history`, { params: query });
  return axiosResponse.data;
}

/**
 *
 *
 *  WEBSOCKET
 *
 *
 */
