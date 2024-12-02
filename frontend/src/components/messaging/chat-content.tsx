import { InfiniteData, QueryKey, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

import React from 'react';

import { useChat } from '@/context/chat-provider';
import { useSession } from '@/context/session-provider';
import { UserStatus } from '@/lib/enum';
import { getRelativeTime } from '@/lib/utils';
import { getChatHistory, getStatus } from '@/services/chat';
import { GetChatHistoryErrorResponse, GetChatHistorySuccessResponse, GetStatusErrorResponse, GetStatusSuccessResponse } from '@/types/api/chat';

import { AvatarUser } from '../shared/avatar-user';
import { ErrorFill } from '../shared/error-fill';
import { LoadingFill } from '../shared/loading-fill';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { SendMessageForm } from './send-message-form';

export function ChatContent() {
  // hooks
  const { session } = useSession();
  const { selectedOtherUser, closeChat } = useChat();

  // Intersection observer hook
  const chatContainerRef = React.useRef<HTMLOListElement>(null);
  const chatEndRef = React.useRef<HTMLLIElement>(null);
  const chatRootRef = React.useRef<HTMLDivElement>(null);
  const { ref: chatSentinelRef, inView: chatSentinelInView } = useInView({
    root: chatRootRef.current,
    threshold: 0,
  });

  // Initial user data status (online/offline)
  const { data: userStatus, isSuccess: isSuccessUserStatus } = useQuery<GetStatusSuccessResponse, GetStatusErrorResponse>({
    queryKey: ['user', selectedOtherUser?.otherUserId, 'status'],
    queryFn: async () => getStatus({ user_id: selectedOtherUser!.otherUserId }),
    enabled: !!selectedOtherUser,
    retry: 1,
  });

  // Chat detail query
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
    queryKey: ['chats', selectedOtherUser?.otherUserId, 'content'],
    enabled: !!selectedOtherUser,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 0,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) =>
      getChatHistory(
        { otherUserId: selectedOtherUser!.otherUserId },
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
    if (selectedOtherUser && selectedOtherUser.otherUserId && isSuccessChat) {
      // scroll to bottom
      scrollToBottomInstant();
    }
  }, [selectedOtherUser, isSuccessChat, scrollToBottomInstant]);

  // ensure selectedOtherUser is not null
  if (!selectedOtherUser) return null;

  return (
    <>
      {/* Header */}
      <div className="flex flex-row items-center gap-3 border-b bg-background py-2.5 pl-2 pr-4">
        <Button variant="ghost" size="icon-sm" className="rounded-full" onClick={closeChat}>
          <ChevronLeft />
        </Button>

        <Link to="/users/$userId" params={{ userId: selectedOtherUser.otherUserId }}>
          <div className="w-full space-y-0.5">
            {/* name */}
            <h1 className="text-sm font-bold text-foreground">{selectedOtherUser.name}</h1>

            {/* Status */}
            {isSuccessUserStatus && userStatus.data.status === UserStatus.ONLINE && (
              <p className="text-xs font-medium text-muted-foreground">Online</p>
            )}
          </div>
        </Link>
      </div>

      {/* Content */}
      {/* Pending state */}
      {isPendingChat && <LoadingFill />}

      {/* Error state */}
      {isErrorChat && (
        <ErrorFill
          statusCode={errorChat?.response?.status}
          statusText={errorChat.response?.statusText}
          message={errorChat?.response?.data.message}
          refetch={refetchChat}
        />
      )}

      {/* Success state */}
      {isSuccessChat && (
        <>
          {flattenChats.length === 0 ? (
            <div className="flex flex-auto items-center justify-center">
              <p className="text-base text-muted-foreground">Send a message to start chatting</p>
            </div>
          ) : (
            <ScrollArea className="flex flex-auto" ref={chatRootRef} key={selectedOtherUser.otherUserId}>
              <ol className="flex flex-col py-2" ref={chatContainerRef}>
                {/* Sentinel top */}
                <li ref={chatSentinelRef} className="flex items-center justify-center">
                  {hasNextPageChat && <LoadingFill className="border-t py-5" />}
                </li>

                {flattenChats.map((message) => (
                  <li className="flex flex-row items-start gap-3 bg-background p-4" key={message.chat_id}>
                    {/* Avatar */}
                    <AvatarUser
                      src={message.from_user_id == session?.userId ? session.profilePhoto : selectedOtherUser.profileProfilePhoto}
                      alt={`${message.from_user_id == session?.userId ? session.name : selectedOtherUser.name}'s profile picture`}
                      classNameAvatar="size-10"
                    />

                    {/* Message */}
                    <div className="flex flex-auto flex-col gap-1">
                      <div className="flex flex-row items-center gap-2">
                        {/* Name */}
                        <p className="text-sm font-bold text-foreground">
                          {message.from_user_id == session?.userId ? session.name : selectedOtherUser.name}
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
    </>
  );
}
