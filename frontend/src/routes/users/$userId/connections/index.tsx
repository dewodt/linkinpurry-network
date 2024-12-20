import { useQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { Clock4, Ellipsis, SearchIcon } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

import * as React from 'react';

import { ConnectDialog } from '@/components/connections/connect-dialog';
import { UnConnectDropdown } from '@/components/connections/unconnect-dropdown';
import { AvatarUser } from '@/components/shared/avatar-user';
import { ErrorFill } from '@/components/shared/error-fill';
import { HelmetTemplate } from '@/components/shared/helmet';
import { LoadingFill } from '@/components/shared/loading-fill';
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
import { useSession } from '@/context/session-provider';
import { ConnectionStatus } from '@/lib/enum';
import { getConnectionsRequestQuery } from '@/lib/schemas/connection';
import { getConnectionLists } from '@/services/connection';
import { GetConnectionsErrorResponse, GetConnectionsSuccessResponse } from '@/types/api/connection';

export const Route = createFileRoute('/users/$userId/connections/')({
  component: RouteComponent,
  validateSearch: (search) => getConnectionsRequestQuery.parse(search),
});

function RouteComponent() {
  // hooks
  const navigate = useNavigate();
  const { session } = useSession();

  // path params
  const { userId } = useParams({ from: '/users/$userId/connections/' });

  // query params
  const { search, page, limit } = useSearch({
    from: '/users/$userId/connections/',
  });

  // states
  const [searchInput, setSearchInput] = React.useState(search);

  // debounced for automatic submit
  const debouncedSearchCallback = useDebouncedCallback(
    (val: string) => navigate({ to: '/users/$userId/connections', params: { userId }, search: { search: val || undefined, page: 1 } }), // reset page to 1
    500,
  );

  // Query
  const {
    data: connections,
    isSuccess: isSuccessConnections,
    isPending: isPendingConnections,
    error: errorConnections,
    isError: isErrorConnections,
    refetch,
  } = useQuery<GetConnectionsSuccessResponse, GetConnectionsErrorResponse>({
    queryKey: ['users', userId, 'connections', search, page, limit],
    queryFn: () => getConnectionLists({ userId }, { search, page, limit }),
  });

  // Handlers
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // prevent blink
    e.preventDefault();
  };

  // Everytime query params change, reset scroll state (page, limit, search)
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [search, page, limit]);

  return (
    <>
      {isSuccessConnections && <HelmetTemplate title={`Connections | LinkinPurry`} />}

      <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
        <section className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          {/* Header */}
          <header className="flex flex-col gap-2 border-b p-5 sm:gap-0">
            <h1 className="text-lg font-bold">{isSuccessConnections && <>{connections.meta.totalItems}</>} Connections</h1>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Sorted by: <span className="font-bold">Recently added</span>
              </p>

              {/* Search input */}
              <search>
                <form className="relative flex flex-1 sm:max-w-64" onSubmit={handleFormSubmit}>
                  <label htmlFor="search-connection" className="sr-only"></label>
                  <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    id="search-connection"
                    placeholder="Search connection"
                    className="h-9 bg-muted pl-9 text-sm"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      debouncedSearchCallback(e.target.value);
                    }}
                  />
                </form>
              </search>
            </div>
          </header>

          {/* Pending */}
          {isPendingConnections && <LoadingFill className="min-h-[512px]" />}

          {/* Error */}
          {isErrorConnections && (
            <ErrorFill
              className="min-h-[512px]"
              statusCode={errorConnections?.response?.status}
              statusText={errorConnections.response?.statusText}
              message={errorConnections?.response?.data.message}
              refetch={refetch}
            />
          )}

          {/* Content */}
          {isSuccessConnections && (
            <div>
              {connections.meta.totalItems === 0 ? (
                <div className="flex min-h-64 items-center justify-center p-5">
                  <p className="text-lg text-muted-foreground">No connections exists</p>
                </div>
              ) : (
                <ol>
                  {connections.body.map((con) => {
                    return (
                      <li
                        key={con.user_id}
                        className="flex flex-col items-start gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:gap-5"
                      >
                        <Link to="/users/$userId" params={{ userId: con.user_id }} className="flex flex-auto flex-row items-center gap-3.5">
                          {/* Avatar */}
                          <AvatarUser src={con.profile_photo} alt={`${con.name}'s profile picture`} classNameAvatar="size-14" />

                          <div className="flex-auto">
                            <h2 className="line-clamp-1 break-all text-lg font-semibold text-foreground decoration-2 underline-offset-2 hover:underline">
                              {con.name}
                            </h2>
                            <p className="line-clamp-3 break-all text-sm font-medium text-muted-foreground sm:line-clamp-2">{con.work_history}</p>
                          </div>
                        </Link>

                        <div className="flex flex-row items-center gap-2 self-end sm:self-auto">
                          {session &&
                            session.userId !== con.user_id &&
                            (con.connection_status === ConnectionStatus.NONE ? (
                              <ConnectDialog currentSeenUserId={userId} connectToUserId={con.user_id} connectToUsername={con.username}>
                                <Button className="rounded-full font-bold" variant={'outline-primary'} size={'xs'}>
                                  Connect
                                </Button>
                              </ConnectDialog>
                            ) : con.connection_status === ConnectionStatus.PENDING ? (
                              <Button className="gap-1.5 rounded-full font-bold" variant={'outline-muted'} size={'xs'} disabled>
                                <Clock4 className="size-4" />
                                Pending
                              </Button>
                            ) : (
                              <Link to="/messaging" search={{ withUserId: con.user_id }}>
                                <Button className="rounded-full font-bold" variant={'outline-primary'} size={'xs'}>
                                  Message
                                </Button>
                              </Link>
                            ))}

                          {/* Dropdown actions */}
                          {session && session.userId !== con.user_id && con.connection_status === ConnectionStatus.ACCEPTED && (
                            <UnConnectDropdown unConnectToUserId={con.user_id} unConnectToUsername={con.username} currentSeenUserId={userId}>
                              <Button
                                size="icon-xs"
                                variant="ghost"
                                className="rounded-full text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                              >
                                <Ellipsis className="size-5" />
                              </Button>
                            </UnConnectDropdown>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          )}

          {/* Pagination */}
          {/* 1 2 3 4 5 6 7 */}
          {/* 1 2 3 4 5 ... 10 */}
          {/* 1 ... 3 4 5 ... 10 */}
          {/* 1 ... 6 7 8 9 10 */}
          {isSuccessConnections && connections.meta.totalItems > 0 && (
            <div className="p-5">
              <Pagination>
                <PaginationContent className="flex-wrap gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      to="/users/$userId/connections"
                      disabled={connections.meta.page === 1}
                      params={{ userId }}
                      search={{ page: connections.meta.page - 1, limit, search }}
                    />
                  </PaginationItem>

                  {/* Mobile */}
                  <PaginationItem className="md:hidden">
                    Page {connections.meta.page} of {connections.meta.totalPages}
                  </PaginationItem>

                  {/* Desktop */}
                  {connections.meta.totalPages < 8 ? (
                    // Fill as many as possible
                    <>
                      {Array.from({ length: connections.meta.totalPages }).map((_, idx) => {
                        return (
                          <PaginationItem key={idx} className="hidden md:block">
                            <PaginationNumber
                              to="/users/$userId/connections"
                              isActive={connections.meta.page === idx + 1}
                              params={{ userId }}
                              search={{ page: idx + 1, limit, search }}
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
                              search={{ page: idx + 1, limit, search }}
                            >
                              {idx + 1}
                            </PaginationNumber>
                          </PaginationItem>
                        );
                      })}

                      <PaginationEllipsis className="hidden md:flex" />

                      <PaginationItem className="hidden md:block">
                        <PaginationNumber
                          to="/users/$userId/connections"
                          isActive={connections.meta.page === connections.meta.totalPages}
                          params={{ userId }}
                          search={{ page: connections.meta.totalPages, limit, search }}
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
                          search={{ page: 1, limit, search }}
                        >
                          1
                        </PaginationNumber>
                      </PaginationItem>

                      <PaginationEllipsis className="hidden md:flex" />

                      {Array.from({ length: 5 }).map((_, idx) => {
                        const pg = connections.meta.totalPages - 5 + 1 + idx;
                        return (
                          <PaginationItem key={idx} className="hidden md:block">
                            <PaginationNumber
                              to="/users/$userId/connections"
                              isActive={connections.meta.page === pg}
                              params={{ userId }}
                              search={{ page: pg, limit, search }}
                            >
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
                        <PaginationNumber
                          to="/users/$userId/connections"
                          isActive={connections.meta.page === 1}
                          params={{ userId }}
                          search={{ page: 1, limit, search }}
                        >
                          1
                        </PaginationNumber>
                      </PaginationItem>

                      <PaginationEllipsis className="hidden md:flex" />

                      {/* Page n-4 elements */}
                      {Array.from({ length: 7 - 4 }).map((_, idx) => {
                        const pg = connections.meta.page - 2 + idx + 1;
                        return (
                          <PaginationItem key={idx} className="hidden md:block">
                            <PaginationNumber
                              to="/users/$userId/connections"
                              isActive={connections.meta.page === pg}
                              params={{ userId }}
                              search={{ page: pg, limit, search }}
                            >
                              {pg}
                            </PaginationNumber>
                          </PaginationItem>
                        );
                      })}

                      <PaginationEllipsis className="hidden md:flex" />

                      {/* Last page elements */}
                      <PaginationItem className="hidden md:block">
                        <PaginationNumber
                          to="/users/$userId/connections"
                          isActive={connections.meta.page === connections.meta.totalPages}
                          params={{ userId }}
                          search={{ page: connections.meta.totalPages, limit, search }}
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
                      search={{ page: connections.meta.page + 1, limit, search }}
                      disabled={connections.meta.page === connections.meta.totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
