import { InfiniteData, QueryKey, useInfiniteQuery } from '@tanstack/react-query';
import { SearchIcon, SquarePen } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useDebounce } from 'use-debounce';

import React from 'react';

import { NewChatDialog } from '@/components/messaging/new-chat-dialog';
import { AvatarUser } from '@/components/shared/avatar-user';
import { ErrorFill } from '@/components/shared/error-fill';
import { HelmetTemplate } from '@/components/shared/helmet';
import { LoadingFill } from '@/components/shared/loading-fill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/context/chat-provider';
import { useSession } from '@/context/session-provider';
import { useMediaQuery } from '@/hooks/use-mediaquery';
import { getRelativeTime } from '@/lib/utils';
import { getChatInbox, joinChatRooms } from '@/services/chat';
import { GetChatInboxErrorResponse, GetChatInboxSuccessResponse } from '@/types/api/chat';

interface ChatLayoutProps {
  children: React.ReactNode;
}

/**
 * Contains the message search, new message, and also the inbox view
 */
export function ChatLayout({ children }: ChatLayoutProps) {
  // search state
  const [searchMessage, setSearchMessage] = React.useState('');
  const [debouncedSearchMessage] = useDebounce(searchMessage, 500);

  // Common hooks
  const { session } = useSession();
  const { selectedOtherUser, setOtherUser } = useChat();
  const isMinimumSmViewport = useMediaQuery('(min-width: 640px');

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
    queryKey: ['chats', 'inbox', debouncedSearchMessage],
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 0,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      // Get data
      const response = await getChatInbox({
        search: debouncedSearchMessage,
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

  const flattenInbox = React.useMemo(() => inboxData?.pages.flatMap((page) => page.data) ?? [], [inboxData]);

  // Fetch next page when inbox sentinel is in view
  React.useEffect(() => {
    if (inboxSentinelInView && !isFetchingNextPageInbox && hasNextPageInbox) {
      fetchNextPageInbox();
    }
  }, [inboxSentinelInView, isFetchingNextPageInbox, hasNextPageInbox, fetchNextPageInbox]);

  // handlers
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // prevent blink
    e.preventDefault();
  };

  console.log(errorInbox);

  return (
    <>
      <HelmetTemplate title="Messaging | LinkinPurry" />

      <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
        <section className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background shadow-md">
          {/* Header */}
          <header className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:gap-6">
            <h1 className="text-lg font-semibold">Messaging</h1>

            <div className="flex flex-row items-center gap-3 sm:flex-auto sm:justify-between">
              {/* Search messages */}
              <search className="flex-auto">
                <form className="relative flex flex-1 sm:max-w-64" onSubmit={handleFormSubmit}>
                  <label htmlFor="search-messages" className="sr-only"></label>
                  <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    id="search-messages"
                    placeholder="Search messages"
                    className="h-9 bg-muted pl-9 text-sm"
                    value={searchMessage}
                    onChange={(e) => setSearchMessage(e.target.value)}
                  />
                </form>
              </search>

              {/* New chat dialog */}
              <NewChatDialog>
                <Button size="icon-sm" className="rounded-full" variant="ghost">
                  <SquarePen className="size-6" />
                </Button>
              </NewChatDialog>
            </div>
          </header>

          <div className="flex h-[576px] flex-row sm:h-[768px]">
            {/* Inbox */}
            {(isMinimumSmViewport || (!isMinimumSmViewport && !selectedOtherUser)) && (
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
                          <li
                            key={inbox.latest_message_id}
                            className="flex h-24 items-center border-b border-border bg-background px-3.5 transition-colors hover:bg-muted"
                          >
                            <button
                              className="flex flex-auto flex-row items-start gap-3"
                              onClick={() =>
                                setOtherUser({
                                  name: inbox.other_user_full_name,
                                  otherUserId: inbox.other_user_id,
                                  profileProfilePhoto: inbox.other_user_profile_photo_path,
                                  username: inbox.other_user_username,
                                })
                              }
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
                                  <h2 className="line-clamp-1 text-lg font-semibold text-foreground">{inbox.other_user_full_name}</h2>

                                  {/* Time preview */}
                                  <p className="text-xs font-medium">{getRelativeTime(new Date(inbox.latest_message_timestamp))}</p>
                                </div>
                                <p className="line-clamp-2 text-sm text-muted-foreground">{inbox.latest_message}</p>
                              </div>
                            </button>
                          </li>
                        ))}

                        <li ref={inboxSentinelRef} className="flex items-center justify-center">
                          {isFetchingNextPageInbox && <LoadingFill className="border-t py-5" />}
                        </li>
                      </ol>
                    </ScrollArea>
                  ))}
              </div>
            )}

            {/* Chat view */}
            {selectedOtherUser && <div className="flex flex-auto flex-col">{children}</div>}
          </div>
        </section>
      </main>
    </>
  );
}
