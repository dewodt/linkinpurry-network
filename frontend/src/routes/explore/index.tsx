import { useQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { SearchIcon } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

import * as React from 'react';

import { ConnectDialog } from '@/components/connections/connect-dialog';
import { LinkedInClockIcon, LinkedInConnectIcon } from '@/components/icons/linkedin-icons';
import { AvatarUser } from '@/components/shared/avatar-user';
import { ErrorFill } from '@/components/shared/error-fill';
import { LoadingFill } from '@/components/shared/loading-fill';
import { WarningFill } from '@/components/shared/warning-fill';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationNumber,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useSession } from '@/context/session-provider';
import { ConnectionStatus } from '@/lib/enum';
import { getUsersRequestQuery } from '@/lib/schemas/user';
import { getUsers } from '@/services/user';
import { GetUsersErrorResponse, GetUsersSuccessResponse } from '@/types/api/user';

export const Route = createFileRoute('/explore/')({
  component: RouteComponent,
  validateSearch: (search) => getUsersRequestQuery.parse(search),
});

function RouteComponent() {
  // hooks
  const { session } = useSession();
  const navigate = useNavigate({ from: '/explore' });
  const { search, page, limit } = useSearch({
    from: '/explore/',
  });

  // Search state
  const [searchInput, setSearchInput] = React.useState<string>(search || '');
  const debouncedCallbackSearch = useDebouncedCallback((val) => navigate({ search: { search: val || undefined, page: 1, limit: 15 } }), 500);

  // Handle changes from navbar search after mounting
  React.useEffect(() => {
    setSearchInput(search || '');
  }, [search]);

  // Query
  const {
    data: users,
    error: errorUsers,
    isSuccess: isSuccessUsers,
    isPending: isPendingUsers,
    isError: isErrorUsers,
    refetch,
  } = useQuery<GetUsersSuccessResponse, GetUsersErrorResponse>({
    queryKey: ['users', 'explore', search, page, limit],
    queryFn: async () => getUsers({ search, page, limit }),
  });

  // Handlers
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // prevent blinking
    e.preventDefault();
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
      <section className="flex w-full max-w-3xl flex-col gap-8">
        {/* Title & search bar */}
        <Card>
          <CardContent className="space-y-0 p-6">
            <h1 className="mb-4 text-xl font-bold">Expand Your Network</h1>
            <div className="flex items-center gap-4">
              <AvatarUser src={session?.profilePhoto || ''} alt={`${session?.name}'s Avatar`} classNameAvatar="size-10" />

              <search className="flex w-full flex-auto">
                <form className="relative flex-auto" onSubmit={handleFormSubmit}>
                  <label htmlFor="search-connection" className="sr-only"></label>
                  <SearchIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    id="search-user"
                    placeholder="Search a user"
                    className="h-10 rounded-full bg-muted pl-10"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      debouncedCallbackSearch(e.target.value);
                    }}
                  />
                </form>
              </search>
              {/* <Input className="h-10 rounded-full bg-muted px-5" placeholder="Create new post" /> */}
            </div>
          </CardContent>
        </Card>

        {/* Pendingt state */}
        {isPendingUsers && <LoadingFill className="h-40" />}

        {/* Error state */}
        {isErrorUsers && (
          <ErrorFill
            className="h-40"
            statusCode={errorUsers?.response?.status}
            statusText={errorUsers.response?.statusText}
            message={errorUsers?.response?.data.message}
            refetch={refetch}
          />
        )}

        {/* Success state */}
        {isSuccessUsers && (
          <div className="flex flex-col gap-4">
            {/* Content */}
            {users.meta.totalItems === 0 ? (
              <WarningFill className="h-40" message="No users found" />
            ) : (
              <>
                <ol className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {users.data.map((user) => {
                    return (
                      <li key={user.id}>
                        <div className="relative flex flex-col gap-1 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                          {/* Background Color */}
                          <div className="h-20 bg-primary/25" />

                          <Link
                            to="/users/$userId"
                            params={{ userId: user.id }}
                            className="absolute left-1/2 top-6 flex w-full -translate-x-1/2 flex-col items-center gap-1 px-5"
                          >
                            {/* Avatar */}
                            <AvatarUser src={user.profile_photo} alt={`${user.username}'s profile picture`} classNameAvatar="size-20" />
                            <div className="space-y-0.5 text-center">
                              <p className="line-clamp-1 break-all text-lg font-semibold text-foreground decoration-2 underline-offset-2 hover:underline">
                                {user.name}
                              </p>
                              <p className="line-clamp-1 break-all text-sm font-medium text-muted-foreground">@{user.username}</p>
                            </div>
                          </Link>

                          {/* White */}
                          <div className="flex items-center justify-center bg-background px-5 pb-5 pt-[86px]">
                            {session &&
                              session.userId !== user.id &&
                              (user.connection_status === ConnectionStatus.NONE ? (
                                <ConnectDialog connectToUserId={user.id} connectToUsername={user.username}>
                                  <Button className="gap-1.5 rounded-full font-bold" size="xs">
                                    <LinkedInConnectIcon className="size-4" />
                                    Connect
                                  </Button>
                                </ConnectDialog>
                              ) : user.connection_status === ConnectionStatus.PENDING ? (
                                <Button className="gap-1.5 rounded-full font-bold" variant="outline-muted" size="xs" disabled>
                                  <LinkedInClockIcon className="size-4" />
                                  Pending
                                </Button>
                              ) : (
                                <Link to="/messaging" search={{ withUserId: user.id }}>
                                  <Button className="rounded-full px-5 font-bold" size="xs">
                                    Message
                                  </Button>
                                </Link>
                              ))}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {/* Pagination */}
                <div className="p-5">
                  <Pagination>
                    <PaginationContent className="flex-wrap gap-2">
                      <PaginationItem>
                        <PaginationPrevious to="/explore" disabled={users.meta.page === 1} search={{ page: users.meta.page - 1, limit }} />
                      </PaginationItem>

                      {/* Mobile */}
                      <PaginationItem className="md:hidden">
                        Page {users.meta.page} of {users.meta.totalPages}
                      </PaginationItem>

                      {/* Desktop */}
                      {users.meta.totalPages < 8 ? (
                        // Fill as many as possible
                        <>
                          {Array.from({ length: users.meta.totalPages }).map((_, idx) => {
                            return (
                              <PaginationItem key={idx} className="hidden md:block">
                                <PaginationNumber to="/explore" isActive={users.meta.page === idx + 1} search={{ page: idx + 1, limit }}>
                                  {idx + 1}
                                </PaginationNumber>
                              </PaginationItem>
                            );
                          })}
                        </>
                      ) : users.meta.page < 6 ? (
                        // Case Left sided
                        <>
                          {Array.from({ length: 5 }).map((_, idx) => {
                            return (
                              <PaginationItem key={idx} className="hidden md:block">
                                <PaginationNumber to="/explore" isActive={users.meta.page === idx + 1} search={{ page: idx + 1, limit }}>
                                  {idx + 1}
                                </PaginationNumber>
                              </PaginationItem>
                            );
                          })}

                          <PaginationEllipsis className="hidden md:flex" />

                          <PaginationItem className="hidden md:block">
                            <PaginationNumber
                              to="/explore"
                              isActive={users.meta.page === users.meta.totalPages}
                              search={{
                                page: users.meta.totalPages,
                                limit,
                              }}
                            >
                              {users.meta.totalPages}
                            </PaginationNumber>
                          </PaginationItem>
                        </>
                      ) : users.meta.page > users.meta.totalPages - 5 ? (
                        // Case Right sided
                        <>
                          <PaginationItem className="hidden md:block">
                            <PaginationNumber to="/explore" isActive={users.meta.page === 1} search={{ page: 1, limit }}>
                              1
                            </PaginationNumber>
                          </PaginationItem>

                          <PaginationEllipsis className="hidden md:flex" />

                          {Array.from({ length: 5 }).map((_, idx) => {
                            const pg = users.meta.totalPages - 5 + 1 + idx;
                            return (
                              <PaginationItem key={idx} className="hidden md:block">
                                <PaginationNumber to="/explore" isActive={users.meta.page === pg} search={{ page: pg, limit }}>
                                  {pg}
                                </PaginationNumber>
                              </PaginationItem>
                            );
                          })}
                        </>
                      ) : (
                        // Case Centered
                        <>
                          {/* First page elements */}
                          <PaginationItem className="hidden md:block">
                            <PaginationNumber to="/explore" isActive={users.meta.page === 1} search={{ page: 1, limit }}>
                              1
                            </PaginationNumber>
                          </PaginationItem>

                          <PaginationEllipsis className="hidden md:flex" />

                          {/* Page n-4 elements */}
                          {Array.from({ length: 7 - 4 }).map((_, idx) => {
                            const pg = users.meta.page - 2 + idx + 1;
                            return (
                              <PaginationItem key={idx} className="hidden md:block">
                                <PaginationNumber to="/explore" isActive={users.meta.page === pg} search={{ page: pg, limit }}>
                                  {pg}
                                </PaginationNumber>
                              </PaginationItem>
                            );
                          })}

                          <PaginationEllipsis className="hidden md:flex" />

                          {/* Last page elements */}
                          <PaginationItem className="hidden md:block">
                            <PaginationNumber
                              to="/explore"
                              isActive={users.meta.page === users.meta.totalPages}
                              search={{
                                page: users.meta.totalPages,
                                limit,
                              }}
                            >
                              {users.meta.totalPages}
                            </PaginationNumber>
                          </PaginationItem>
                        </>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          to="/explore"
                          search={{ page: users.meta.page + 1, limit }}
                          disabled={users.meta.page === users.meta.totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
