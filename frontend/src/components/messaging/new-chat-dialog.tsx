import { InfiniteData, QueryKey, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Search, SearchIcon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { useDebounce, useDebouncedCallback } from 'use-debounce';

import React from 'react';

import { AvatarUser } from '@/components/shared/avatar-user';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/context/session-provider';
import { cn } from '@/lib/utils';
import { joinChatRooms } from '@/services/chat';
import { getConnectionLists } from '@/services/connection';
import type { GetConnectionsErrorResponse, GetConnectionsResponseBody, GetConnectionsSuccessResponse } from '@/types/api/connection';

import { ErrorFill } from '../shared/error-fill';
import { LoadingFill } from '../shared/loading-fill';
import { WarningFill } from '../shared/warning-fill';

interface NewChatDialogProps {
  children: React.ReactNode;
}

const NewChatDialog = ({ children }: NewChatDialogProps) => {
  // States
  // dialog
  const [isOpen, setIsOpen] = React.useState(false);

  // search
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  // Hooks
  const queryClient = useQueryClient();
  const { session } = useSession();

  // Clear search and queries when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setSearch('');
      queryClient.removeQueries({ queryKey: ['users', session?.userId, 'connections'] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, queryClient]);

  // handlers
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // prevent blink
    e.preventDefault();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-[360px] gap-0 rounded-lg p-0 sm:max-w-[480px]">
        <DialogHeader className="space-y-3 border-b p-5">
          <div className="space-y-1.5 text-left">
            <DialogTitle>New Chat</DialogTitle>
            <DialogDescription>Create a new conversation.</DialogDescription>
          </div>

          <search>
            <form className="relative flex flex-1 sm:max-w-64" onSubmit={handleFormSubmit}>
              <label htmlFor="search-connection" className="sr-only"></label>
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                id="search-connection"
                placeholder="Search connection"
                className="h-9 bg-muted pl-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
          </search>
        </DialogHeader>

        <UserList debouncedSearch={debouncedSearch} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
};

interface UserListProps {
  debouncedSearch: string;
  setIsOpen: (isOpen: boolean) => void;
}

export const UserList = ({ debouncedSearch, setIsOpen }: UserListProps) => {
  // hooks
  const searchParams = useSearch({ from: '/messaging/' });
  const navigate = useNavigate();
  const { session } = useSession();

  // Intersection observer
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { ref: sentinelRef, inView } = useInView({
    root: rootRef.current,
    threshold: 0.25,
  });

  // Query
  const limit = 10;
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery<
    GetConnectionsSuccessResponse,
    GetConnectionsErrorResponse,
    InfiniteData<GetConnectionsSuccessResponse>,
    QueryKey,
    number
  >({
    queryKey: ['users', session?.userId, 'connections', debouncedSearch],
    enabled: !!debouncedSearch,
    retry: 0,
    refetchOnWindowFocus: false,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      getConnectionLists(
        { userId: session?.userId ?? '' },
        {
          search: debouncedSearch,
          page: pageParam,
          limit,
        },
      ),
    getNextPageParam: (lastPage) => (lastPage.meta.page === lastPage.meta.totalPages ? undefined : lastPage.meta.page + 1),
  });

  // Debounce
  const debouncedFetchNextPage = useDebouncedCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, 150);

  const allUsers = data?.pages.flatMap((page) => page.body) ?? [];

  React.useEffect(() => {
    if (inView) {
      debouncedFetchNextPage();
    }
  }, [inView, debouncedFetchNextPage]);

  const { mutate, isPending: isMutating } = useMutation({
    mutationFn: async (user: GetConnectionsResponseBody) => {
      return await joinChatRooms({ user_ids: [user.user_id] });
    },
    onSuccess: (_, variables) => {
      setIsOpen(false);

      navigate({ to: '/messaging', search: { ...searchParams, withUserId: variables.user_id } });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!debouncedSearch) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-1 pb-7 text-center text-muted-foreground">
        <Search className="h-6 w-6" />
        <p>Search for a user to start a conversation</p>
      </div>
    );
  }

  if (isPending) return <LoadingFill className="h-80" />;

  if (isError) return <ErrorFill className="h-80" statusText={error.response?.statusText} message={error.response?.data.message} refetch={refetch} />;

  if (allUsers.length === 0) return <WarningFill className="h-80" message="No users found" />;

  return (
    <ScrollArea className="h-80" ref={rootRef}>
      <ul className="grid grid-cols-1">
        {allUsers.map((user, index) => (
          <li key={user.user_id} className="flex">
            <button
              className={cn(
                'flex flex-auto flex-row items-center gap-3 px-5 py-3 transition-all hover:bg-muted lg:px-5',
                index === allUsers.length - 1 ? 'border-none' : 'border-b',
              )}
              onClick={() => mutate(user)}
              disabled={isMutating}
            >
              <AvatarUser classNameAvatar="size-12" src={user.profile_photo} alt={`${user.username}'s profile picture`} />
              <div className="space-y-1">
                <h4 className="line-clamp-1 break-all text-start text-base font-medium leading-tight">{user.name}</h4>
                <p className="line-clamp-1 break-all text-start text-sm leading-tight text-muted-foreground">@{user.username}</p>
              </div>
            </button>
          </li>
        ))}

        {hasNextPage && (
          <li ref={sentinelRef} className="flex items-center justify-center">
            <LoadingFill hideHelmet className="border-t py-5" />
          </li>
        )}
      </ul>
    </ScrollArea>
  );
};

export { NewChatDialog };
