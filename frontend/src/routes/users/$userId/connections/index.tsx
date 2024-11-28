import { useQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useParams, useSearch } from '@tanstack/react-router';
import { Ellipsis, SearchIcon, UserCircle2 } from 'lucide-react';

import * as React from 'react';

import { ErrorPage } from '@/components/shared/error-page';
import { LoadingPage } from '@/components/shared/loading-page';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import { getConnectionsRequestQuery } from '@/lib/schemas/connection';
import { getConnectionLists } from '@/services/connection';
import { GetConnectionsErrorResponse, GetConnectionsSuccessResponse } from '@/types/api/connection';

export const Route = createFileRoute('/users/$userId/connections/')({
  component: RouteComponent,
  validateSearch: (search) => getConnectionsRequestQuery.parse(search),
});

function RouteComponent() {
  // path params
  const { userId } = useParams({ from: '/users/$userId/connections/' });

  // query params
  const { search, page, limit } = useSearch({
    from: '/users/$userId/connections/',
  });

  const {
    data: connections,
    isPending: isPendingConnections,
    error: errorConnections,
    isError: isErrorConnections,
    refetch,
  } = useQuery<GetConnectionsSuccessResponse, GetConnectionsErrorResponse>({
    queryKey: ['users', userId, 'connections', search, page, limit],
    queryFn: () => getConnectionLists({ userId }, { search, page, limit }),
  });

  if (isPendingConnections) return <LoadingPage />;

  if (isErrorConnections)
    return (
      <ErrorPage
        statusCode={errorConnections?.response?.status}
        statusText={errorConnections.response?.statusText}
        message={errorConnections?.response?.data.message}
        refetch={refetch}
      />
    );

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
      <section className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background shadow-md">
        {/* Header */}
        <header className="flex flex-col gap-2 border-b p-5 sm:gap-0">
          <h1 className="text-lg font-semibold">{connections.meta.totalItems} Connections</h1>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Sorted by: <span className="font-bold">Recently added</span>
            </p>

            {/* Search input */}
            <search>
              <form
                className="relative flex flex-1 sm:max-w-64"
                // onSubmit={handleFormSubmit}
              >
                <label htmlFor="search-connection" className="sr-only"></label>
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  id="search-connection"
                  placeholder="Search connection"
                  className="h-8 bg-muted pl-9 text-xs"
                  // value={searchQuery}
                  // onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </search>
          </div>
        </header>

        {/* Content */}
        {/* Empty state */}
        <div>
          {connections.meta.totalItems === 0 ? (
            <div className="flex min-h-64 items-center justify-center p-5">
              <p className="text-muted-foreground">No connections exists</p>
            </div>
          ) : (
            <ol>
              {connections.data.map((con) => {
                return (
                  <li className="flex flex-row items-center gap-3 border-b border-border px-5 py-4 sm:gap-5">
                    <Link to={`/users/${con.user_id}`} className="flex flex-auto flex-row items-center gap-3.5">
                      {/* Avatar */}
                      <Avatar className="size-14">
                        <AvatarImage src={con.profile_photo} alt={`${con.name}'s profile picture`} />
                        <AvatarFallback>
                          <UserCircle2 className="size-full stroke-gray-500 stroke-[1.25px]" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-auto">
                        <h2 className="text-xl font-bold text-foreground decoration-2 underline-offset-2 hover:underline">{con.name}</h2>
                        <p className="line-clamp-3 text-sm font-medium text-muted-foreground sm:line-clamp-2">{con.work_history}</p>
                      </div>
                    </Link>

                    <div className="flex flex-row items-center gap-3">
                      {/* Message */}
                      <Button
                        className="hidden h-8 rounded-full border-primary font-bold text-primary hover:text-primary sm:block"
                        variant={'outline'}
                        size={'sm'}
                      >
                        Message
                      </Button>

                      {/* Dropdown actions */}
                      <Button size="icon" variant="ghost" className="rounded-full text-muted-foreground">
                        <Ellipsis className="size-5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Pagination */}
        {/* 1 2 3 4 5 6 7 */}
        {/* 1 2 3 4 5 ... 10 */}
        {/* 1 ... 3 4 5 ... 10 */}
        {/* 1 ... 6 7 8 9 10 */}
        {connections.meta.totalItems > 0 && (
          <div className="px-5 pb-5 pt-4">
            <Pagination>
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    to="/users/$userId/connections"
                    disabled={connections.meta.page === 1}
                    params={{ userId }}
                    search={{ page: connections.meta.page - 1, limit: connections.meta.limit, search }}
                  />
                </PaginationItem>

                {/* Mobile */}
                <PaginationItem className="md:hidden">
                  Page {connections.meta.page} of {connections.meta.totalPages}
                </PaginationItem>

                {/* Desktop */}
                {connections.meta.totalPages < 7 ? (
                  // Fill as many as possible
                  <>
                    {Array.from({ length: connections.meta.totalPages }).map((_, idx) => {
                      return (
                        <PaginationItem key={idx} className="hidden md:block">
                          <PaginationNumber
                            to="/users/$userId/connections"
                            isActive={connections.meta.page === idx + 1}
                            params={{ userId }}
                            search={{ page: idx + 1, limit: connections.meta.limit, search }}
                          >
                            {idx + 1}
                          </PaginationNumber>
                        </PaginationItem>
                      );
                    })}
                  </>
                ) : connections.meta.page < 6 ? (
                  // Case Left sided
                  <>
                    {Array.from({ length: 5 }).map((_, idx) => {
                      return (
                        <PaginationItem key={idx} className="hidden md:block">
                          <PaginationNumber
                            to="/users/$userId/connections"
                            isActive={connections.meta.page === idx + 1}
                            params={{ userId }}
                            search={{ page: idx + 1, limit: connections.meta.limit, search }}
                          >
                            {idx + 1}
                          </PaginationNumber>
                        </PaginationItem>
                      );
                    })}

                    <PaginationEllipsis />

                    <PaginationItem className="hidden md:block">
                      <PaginationNumber
                        to="/users/$userId/connections"
                        isActive={connections.meta.page === connections.meta.totalPages}
                        params={{ userId }}
                        search={{ page: connections.meta.totalPages, limit: connections.meta.limit, search }}
                      >
                        {connections.meta.totalPages}
                      </PaginationNumber>
                    </PaginationItem>
                  </>
                ) : connections.meta.page > connections.meta.totalPages - 5 ? (
                  // Case Right sided
                  <>
                    <PaginationItem className="hidden md:block">
                      <PaginationNumber
                        to="/users/$userId/connections"
                        isActive={connections.meta.page === 1}
                        params={{ userId }}
                        search={{ page: 1, limit: connections.meta.limit, search }}
                      >
                        1
                      </PaginationNumber>
                    </PaginationItem>

                    <PaginationEllipsis />

                    {Array.from({ length: 5 }).map((_, idx) => {
                      const pg = connections.meta.page + idx + 1;
                      return (
                        <PaginationItem key={idx} className="hidden md:block">
                          <PaginationNumber
                            to="/users/$userId/connections"
                            isActive={connections.meta.page === pg}
                            params={{ userId }}
                            search={{ page: connections.meta.page + pg, limit: connections.meta.limit, search }}
                          >
                            {connections.meta.page + pg}
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
                      <PaginationNumber
                        to="/users/$userId/connections"
                        isActive={connections.meta.page === 1}
                        params={{ userId }}
                        search={{ page: 1, limit: connections.meta.limit, search }}
                      >
                        1
                      </PaginationNumber>
                    </PaginationItem>

                    <PaginationEllipsis />

                    {/* Page n-4 elements */}
                    {Array.from({ length: 7 - 4 }).map((_, idx) => {
                      return (
                        <PaginationItem key={idx} className="hidden md:block">
                          <PaginationNumber
                            to="/users/$userId/connections"
                            isActive={connections.meta.page === idx + 1}
                            params={{ userId }}
                            search={{ page: idx + connections.meta.page - 2, limit: connections.meta.limit, search }}
                          >
                            {idx + connections.meta.page - 2}
                          </PaginationNumber>
                        </PaginationItem>
                      );
                    })}

                    <PaginationEllipsis />

                    {/* Last page elements */}
                    <PaginationItem className="hidden md:block">
                      <PaginationNumber
                        to="/users/$userId/connections"
                        isActive={connections.meta.page === connections.meta.totalPages}
                        params={{ userId }}
                        search={{ page: connections.meta.totalPages, limit: connections.meta.limit, search }}
                      >
                        {connections.meta.totalPages}
                      </PaginationNumber>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    to="/users/$userId/connections"
                    params={{ userId }}
                    search={{ page: connections.meta.page + 1, limit: connections.meta.limit, search }}
                    disabled={connections.meta.page === connections.meta.totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </main>
  );
}
