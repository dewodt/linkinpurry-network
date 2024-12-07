import { InfiniteData, QueryKey, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

import React from 'react';

import { useSession } from '@/context/session-provider';
import { getRelativeTime } from '@/lib/utils';
import { getChatHistory, getOtherUserProfile } from '@/services/chat';
import { GetChatHistoryErrorResponse, GetChatHistorySuccessResponse, GetOtherUserProfile } from '@/types/api/chat';
import { AxiosErrorResponse } from '@/types/api/common';

import { AvatarUser } from '../shared/avatar-user';
import { ErrorFill } from '../shared/error-fill';
import { LoadingFill } from '../shared/loading-fill';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { SendMessageForm } from './send-message-form';

export function ChatContent() {
  // hooks
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/messaging/' });
  const { session } = useSession();

  // Intersection observer hook
  const chatContainerRef = React.useRef<HTMLOListElement>(null);
  const chatEndRef = React.useRef<HTMLLIElement>(null);
  const chatRootRef = React.useRef<HTMLDivElement>(null);
  const { ref: chatSentinelRef, inView: chatSentinelInView } = useInView({
    root: chatRootRef.current,
    threshold: 0,
  });

  // Get other user profile (with caching or fetching as fallback)
  const {
    data: otherUserProfile,
    isSuccess: isSuccessOtherUserProfile,
    isPending: isPendingOtherUserProfile,
    error: otherUserProfileError,
    isError: isErrorOtherUserProfile,
  } = useQuery<GetOtherUserProfile, AxiosErrorResponse>({
    queryKey: ['user', searchParams.withUserId, 'profile'],
    enabled: !!searchParams.withUserId,
    queryFn: async () => {
      return await getOtherUserProfile({ otherUserId: searchParams.withUserId! });
    },
  });

  // Chat history query
  const limit = 20;
  const {
    data: chatData,
    isSuccess: isSuccessChat,
    isPending: isPendingChat,
    isError: isErrorChat,
    fetchNextPage: fetchNextPageChat,
    hasNextPage: hasNextPageChat,
    isFetchingNextPage: isFetchingNextPageChat,

    error: errorChat,
    refetch: refetchChat,
  } = useInfiniteQuery<
    GetChatHistorySuccessResponse,
    GetChatHistoryErrorResponse,
    InfiniteData<GetChatHistorySuccessResponse>,
    QueryKey,
    string | undefined
  >({
    queryKey: ['chats', searchParams.withUserId, 'content'],
    enabled: !!searchParams.withUserId,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: 0,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) =>
      getChatHistory(
        { otherUserId: searchParams.withUserId! },
        {
          cursor: pageParam,
          limit,
        },
      ),
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor || undefined,
  });

  const flattenChats = React.useMemo(() => (chatData ? chatData.pages.flatMap((page) => page.data).reverse() : []), [chatData]);

  const scrollToBottomInstant = React.useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
  }, [chatEndRef]);

  const scrollToBottomSmooth = React.useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatEndRef]);

  React.useEffect(() => {
    // Fetch more when scroll to top
    if (chatSentinelInView && hasNextPageChat && !isFetchingNextPageChat) {
      fetchNextPageChat();

      // scroll to bottom
      scrollToBottomInstant();
    }
  }, [hasNextPageChat, isFetchingNextPageChat, chatSentinelInView, fetchNextPageChat, scrollToBottomInstant]);

  // When change chat, scroll to bottom aswell
  React.useEffect(() => {
    if (searchParams.withUserId && isSuccessChat) {
      // scroll to bottom
      scrollToBottomInstant();
    }
  }, [searchParams.withUserId, isSuccessChat, scrollToBottomInstant]);

  // ensure selectedOtherUser is not null
  if (!searchParams.withUserId) return null;

  return (
    <div className="flex flex-auto flex-col">
      {/* Content */}
      {/* Pending state */}
      {(isPendingChat || isPendingOtherUserProfile) && <LoadingFill />}

      {/* Error state */}
      {(isErrorChat || isErrorOtherUserProfile) && (
        <ErrorFill
          statusCode={errorChat?.response?.status || otherUserProfileError?.response?.status}
          statusText={errorChat?.response?.statusText || otherUserProfileError?.response?.statusText}
          message={errorChat?.response?.data.message || otherUserProfileError?.response?.data.message}
          refetch={refetchChat}
        />
      )}

      {/* Success state */}
      {isSuccessChat && isSuccessOtherUserProfile && (
        <>
          {/* Header */}
          <div className="flex flex-row items-center gap-3 border-b bg-background py-2.5 pl-2 pr-4">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={() =>
                navigate({
                  to: '/messaging',
                  search: {
                    ...searchParams,
                    withUserId: undefined,
                  },
                })
              }
            >
              <ChevronLeft />
            </Button>

            <Link to="/users/$userId" params={{ userId: searchParams.withUserId }}>
              <div className="w-full space-y-0.5">
                {/* name */}
                <h1 className="text-sm font-bold text-foreground">{otherUserProfile.name}</h1>

                {/* Status */}
                {/* {isSuccessUserStatus && userStatus.data.status === UserStatus.ONLINE && (
              <p className="text-xs font-medium text-muted-foreground">Online</p>
            )} */}
              </div>
            </Link>
          </div>

          {/* Chat history */}
          {flattenChats.length === 0 ? (
            <div className="flex flex-auto items-center justify-center">
              <p className="text-base text-muted-foreground">Send a message to start chatting</p>
            </div>
          ) : (
            <ScrollArea className="flex flex-auto" ref={chatRootRef} key={searchParams.withUserId}>
              <ol className="flex flex-col py-2" ref={chatContainerRef}>
                {/* Sentinel top */}
                <li ref={chatSentinelRef} className="flex items-center justify-center">
                  {hasNextPageChat && <LoadingFill className="border-t py-5" />}
                </li>

                {flattenChats.map((message) => (
                  <li className="flex flex-row items-start gap-3 bg-background p-4" key={message.chat_id}>
                    {/* Avatar */}
                    <AvatarUser
                      src={message.from_user_id == session?.userId ? session.profilePhoto : otherUserProfile.profile_photo}
                      alt={`${message.from_user_id == session?.userId ? session.name : otherUserProfile.name}'s profile picture`}
                      classNameAvatar="size-10"
                    />

                    {/* Message */}
                    <div className="flex flex-auto flex-col gap-1">
                      <div className="flex flex-row items-center gap-2">
                        {/* Name */}
                        <p className="text-sm font-bold text-foreground">
                          {message.from_user_id == session?.userId ? session.name : otherUserProfile.name}
                        </p>

                        <p className="text-xs font-medium text-muted-foreground">{getRelativeTime(new Date(message.timestamp))}</p>
                      </div>

                      {/* Message */}
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </li>
                ))}

                {/* Bottom sentinel */}
                <li ref={chatEndRef}></li>
              </ol>
            </ScrollArea>
          )}
        </>
      )}

      {/* Send message form*/}
      <SendMessageForm scrollToBottomSmooth={scrollToBottomSmooth} />
    </div>
  );
}
