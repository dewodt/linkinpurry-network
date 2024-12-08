import { InfiniteData, QueryKey, useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useInView } from 'react-intersection-observer';
import { useDebouncedCallback } from 'use-debounce';

import React from 'react';

import { AvatarUser } from '@/components/shared/avatar-user';
import { ErrorFill } from '@/components/shared/error-fill';
import { LoadingFill } from '@/components/shared/loading-fill';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, getRelativeTime } from '@/lib/utils';
import { getChatInbox, joinChatRooms } from '@/services/chat';
import { GetChatInboxErrorResponse, GetChatInboxSuccessResponse } from '@/types/api/chat';

export function ChatInbox() {
  //  hooks
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/messaging/' });

  // Intersection observer hook
  const inboxRootRef = React.useRef<HTMLDivElement>(null);
  const { ref: inboxSentinelRef, inView: inboxSentinelInView } = useInView({
    root: inboxRootRef.current,
    threshold: 0.25,
  });

  // Inbox query (infintie query)
  const limit = 15;
  const {
    data: inboxData,
    isPending: isPendingInbox,
    isSuccess: isSuccessInbox,
    isError: isErrorInbox,
    error: errorInbox,
    fetchNextPage: fetchNextPageInbox,
    hasNextPage: hasNextPageInbox,
    isFetchingNextPage: isFetchingNextPageInbox,
    refetch: refetchInbox,
  } = useInfiniteQuery<
    GetChatInboxSuccessResponse,
    GetChatInboxErrorResponse,
    InfiniteData<GetChatInboxSuccessResponse>,
    QueryKey,
    string | undefined
  >({
    queryKey: ['chats', 'inbox', searchParams.search],
    retry: 0,
    refetchOnWindowFocus: false,
    refetchInterval: 0,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      // Get data
      const response = await getChatInbox({
        search: searchParams.search,
        cursor: pageParam,
        limit,
      });

      // join chat rooms
      const otherUserIds = response.data.map((inbox) => inbox.other_user_id);
      if (otherUserIds.length > 0) {
        await joinChatRooms({ user_ids: otherUserIds });
      }

      return response;
    },
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor || undefined,
  });

  // Debounced
  const debouncedFetchNextPageInbox = useDebouncedCallback(() => {
    if (hasNextPageInbox && !isFetchingNextPageInbox) {
      fetchNextPageInbox();
    }
  }, 150);

  const flattenInbox = React.useMemo(() => inboxData?.pages.flatMap((page) => page.data) ?? [], [inboxData]);

  // Fetch next page when inbox sentinel is in view
  React.useEffect(() => {
    if (inboxSentinelInView) {
      debouncedFetchNextPageInbox();
    }
  }, [inboxSentinelInView, debouncedFetchNextPageInbox]);

  return (
    <div className="flex w-full sm:max-w-[312px] sm:border-r">
      {/* Pending */}
      {isPendingInbox && <LoadingFill />}

      {/* Error */}
      {isErrorInbox && (
        <ErrorFill
          statusCode={errorInbox?.response?.status}
          statusText={errorInbox.response?.statusText}
          message={errorInbox?.response?.data.message}
          refetch={refetchInbox}
        />
      )}

      {/* Success */}
      {isSuccessInbox &&
        (flattenInbox.length === 0 ? (
          <div className="flex flex-auto items-center justify-center">
            <p className="text-base text-muted-foreground">Inbox Empty</p>
          </div>
        ) : (
          <ScrollArea ref={inboxRootRef}>
            <ol className="flex flex-col">
              {flattenInbox.map((inbox) => (
                <li className="flex flex-auto" key={inbox.latest_message_id}>
                  <button
                    className={cn(
                      'flex h-24 flex-auto flex-row items-center gap-3 border-b border-border px-3.5 transition-colors hover:bg-muted',
                      inbox.other_user_id === searchParams.withUserId ? 'bg-muted' : 'bg-background',
                    )}
                    onClick={() => navigate({ to: '/messaging', search: { ...searchParams, withUserId: inbox.other_user_id } })}
                  >
                    {/* Avatar */}
                    <AvatarUser
                      src={inbox.other_user_profile_photo_path}
                      alt={`${inbox.other_user_username}'s profile picture`}
                      classNameAvatar="size-12 self-center"
                    />

                    {/* Name & message preview */}
                    <div className="flex flex-auto flex-col text-left">
                      <div className="flex flex-auto flex-row items-center justify-between gap-1">
                        <h2 className="line-clamp-1 break-all text-lg font-semibold text-foreground">{inbox.other_user_full_name}</h2>

                        {/* Time preview */}
                        <p className="flex-none text-xs font-medium">{getRelativeTime(new Date(inbox.latest_message_timestamp))}</p>
                      </div>

                      <p className="line-clamp-2 break-all text-sm text-muted-foreground">{inbox.latest_message}</p>
                    </div>
                  </button>
                </li>
              ))}

              {hasNextPageInbox && (
                <li ref={inboxSentinelRef} className="flex items-center justify-center">
                  <LoadingFill className="py-5" />
                </li>
              )}
            </ol>
          </ScrollArea>
        ))}
    </div>
  );
}
