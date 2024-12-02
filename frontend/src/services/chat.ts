import { api } from '@/lib/api';
import { emitWithAck } from '@/lib/socket-io';
import {
  GetChatHistoryRequestParams,
  GetChatHistoryRequestQuery,
  GetChatHistorySuccessResponse,
  GetChatInboxRequestQuery,
  GetChatInboxSuccessResponse,
  GetStatusRequestData,
  GetStatusSuccessResponse,
  JoinChatRoomsRequestData,
  JoinChatRoomsSuccessResponse,
  SendMessageRequestData,
  SendMessageSuccessResponse,
  SendStopTypingRequestData,
  SendStopTypingSuccessResponse,
  SendTypingRequestData,
  SendTypingSuccessResponse,
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

/**
 * Join chat rooms
 */
export async function joinChatRooms(data: JoinChatRoomsRequestData): Promise<JoinChatRoomsSuccessResponse> {
  return emitWithAck<JoinChatRoomsSuccessResponse>('joinChatRooms', data);
}

/**
 * Get status
 */
export async function getStatus(data: GetStatusRequestData): Promise<GetStatusSuccessResponse> {
  return emitWithAck<GetStatusSuccessResponse>('getStatus', data);
}

/**
 * Send message
 */
export async function sendMessage(data: SendMessageRequestData): Promise<SendMessageSuccessResponse> {
  return emitWithAck<SendMessageSuccessResponse>('sendMessage', data);
}

/**
 * Send typing
 */
export async function sendTyping(data: SendTypingRequestData): Promise<SendTypingSuccessResponse> {
  return emitWithAck<SendTypingSuccessResponse>('sendTyping', data);
}

/**
 * Send stop typing
 */
export async function sendStopTyping(data: SendStopTypingRequestData): Promise<SendStopTypingSuccessResponse> {
  return emitWithAck<SendStopTypingSuccessResponse>('sendStopTyping', data);
}
