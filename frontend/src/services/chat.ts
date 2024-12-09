import { InfiniteData, QueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { emitWithAck } from '@/lib/socket-io';
import {
  GetChatHistoryRequestParams,
  GetChatHistoryRequestQuery,
  GetChatHistorySuccessResponse,
  GetChatInboxRequestQuery,
  GetChatInboxSuccessResponse,
  GetOtherUserProfile,
  GetOtherUserProfileRequestParams,
  GetStatusRequestData,
  GetStatusSuccessResponse,
  JoinChatRoomsRequestData,
  JoinChatRoomsSuccessResponse,
  SendMessageRequestData,
  SendMessageResponseData,
  SendMessageSuccessResponse,
  SendStopTypingRequestData,
  SendStopTypingSuccessResponse,
  SendTypingRequestData,
  SendTypingSuccessResponse,
} from '@/types/api/chat';

import { getProfile } from './user';

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
 * Get profile of other chat user
 * TODO: optimizaton to use cache first
 * 1st attempt: find in user lists cache
 * 2nd attempt: find in chat inbox cache
 * 3rd attempt: find from user profile cache
 * last attempt: fetch from /api/users/$userId
 */
export async function getOtherUserProfile({ otherUserId }: GetOtherUserProfileRequestParams): Promise<GetOtherUserProfile> {
  // Get from user lists cache
  // ...

  // Last attemp
  const axiosResponse = await getProfile({ userId: otherUserId });
  return {
    name: axiosResponse.body.name,
    profile_photo: axiosResponse.body.profile_photo,
    username: axiosResponse.body.username,
  };
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

// Update chat inbox when sending message
export function updateSendMessageQueryDataInbox(queryClient: QueryClient, responseData: SendMessageResponseData) {
  // Update all chat inbox queries if no filter
  // Otherwise, update only the chat inbox queries that match the filter (ILIKE % filter %)
  queryClient.setQueriesData<InfiniteData<GetChatInboxSuccessResponse>>(
    {
      predicate: (query) => {
        const isChatInbox = query.queryKey.length >= 2 && query.queryKey[0] === 'chats' && query.queryKey[1] === 'inbox';
        if (!isChatInbox) return false;

        const filterKeyword = query.queryKey[2] as string | undefined;
        const isFilterEmpty = !filterKeyword || filterKeyword === '';

        if (isFilterEmpty) return true;

        const escapedKeyword = filterKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b.*${escapedKeyword}.*\\b`, 'i');
        return regex.test(responseData.message);
      },
    },
    (oldData) => {
      if (!oldData) return oldData;

      // Find if the inbox is in the list
      const pageIdx = oldData.pages.findIndex((page) => page.body.some((inbox) => inbox.other_user_id === responseData.other_user_id));

      if (pageIdx === -1) {
        // If not found, add it to the first page
        const firstPage = oldData.pages[0];
        const newFirstPage: GetChatInboxSuccessResponse = {
          ...firstPage,
          body: [
            {
              other_user_id: responseData.other_user_id,
              other_user_full_name: responseData.other_user_full_name,
              other_user_profile_photo_path: responseData.other_user_profile_photo_path,
              other_user_username: responseData.other_user_username,
              latest_message_id: responseData.message_id,
              latest_message: responseData.message,
              latest_message_timestamp: responseData.timestamp,
            },
            ...firstPage.body,
          ],
        };
        const newPages = [newFirstPage, ...oldData.pages.slice(1)];

        return {
          pageParams: oldData.pageParams,
          pages: newPages,
        };
      } else {
        // If found, remove from found page and move it to the first page
        const foundPage = oldData.pages[pageIdx];
        const updatedFoundPage: GetChatInboxSuccessResponse = {
          ...foundPage,
          body: foundPage.body.filter((inbox) => inbox.other_user_id !== responseData.other_user_id),
        };
        const firstPage = oldData.pages[0];
        const newFirstPage: GetChatInboxSuccessResponse = {
          ...firstPage,
          body: [
            {
              other_user_full_name: responseData.other_user_full_name,
              other_user_id: responseData.other_user_id,
              other_user_profile_photo_path: responseData.other_user_profile_photo_path,
              other_user_username: responseData.other_user_username,
              latest_message_id: responseData.message_id,
              latest_message: responseData.message,
              latest_message_timestamp: responseData.timestamp,
            },
            ...firstPage.body.filter((inbox) => inbox.other_user_id !== responseData.other_user_id),
          ],
        };

        if (pageIdx == 0) {
          const newPages = [newFirstPage, ...oldData.pages.slice(1)];

          return {
            pageParams: oldData.pageParams,
            pages: newPages,
          };
        } else {
          const newPages = [newFirstPage, ...oldData.pages.slice(1, pageIdx), updatedFoundPage, ...oldData.pages.slice(pageIdx + 1)];

          return {
            pageParams: oldData.pageParams,
            pages: newPages,
          };
        }
      }
    },
  );
}

// Update chat hsitory messages (when receive or send new message)
export function updateSendMessageQueryDataMessage(queryClient: QueryClient, responseData: SendMessageResponseData) {
  queryClient.setQueryData<InfiniteData<GetChatHistorySuccessResponse>>(['chats', responseData.other_user_id, 'content'], (oldData) => {
    if (!oldData) return oldData;

    // Add the new message to the first page
    const firstPage = oldData.pages[0];
    const newPage: GetChatHistorySuccessResponse = {
      ...firstPage,
      body: [
        {
          from_user_id: responseData.from_user_id,
          message: responseData.message,
          chat_id: responseData.message_id,
          timestamp: responseData.timestamp,
        },
        ...firstPage.body,
      ],
    };
    const updatedPage = [newPage, ...oldData.pages.slice(1)];

    return {
      pageParams: oldData.pageParams,
      pages: updatedPage,
    };
  });
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
