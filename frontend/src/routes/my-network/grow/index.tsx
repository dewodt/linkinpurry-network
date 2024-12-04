import { useQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useSearch } from '@tanstack/react-router';

import * as React from 'react';

import { DecideDialog } from '@/components/connections/decide-dialog';
import { AvatarUser } from '@/components/shared/avatar-user';
import { ErrorFill } from '@/components/shared/error-fill';
import { HelmetTemplate } from '@/components/shared/helmet';
import { LoadingFill } from '@/components/shared/loading-fill';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationNumber,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { AuthGuardLayout } from '@/layouts/auth-guard-layout';
import { ConnectionRequestDecision } from '@/lib/enum';
import { getConnectionReqsRequestQuery } from '@/lib/schemas/connection';
import { getConnectionRequests } from '@/services/connection';
import { GetConnectionReqsErrorResponse, GetConnectionReqsSuccessResponse } from '@/types/api/connection';

export const Route = createFileRoute('/my-network/grow/')({
  component: RouteComponent,
  validateSearch: (search) => getConnectionReqsRequestQuery.parse(search),
});

function RouteComponent() {
  // query params
  const { page, limit } = useSearch({
    from: '/my-network/grow/',
  });

  // Query
  const {
    data: connections,
    isSuccess: isSuccessConnections,
    isPending: isPendingConnections,
    error: errorConnections,
    isError: isErrorConnections,
    refetch,
  } = useQuery<GetConnectionReqsSuccessResponse, GetConnectionReqsErrorResponse>({
    queryKey: ['my-networks', page, limit],
    queryFn: async () => getConnectionRequests({ page, limit }),
  });

  // Everytime query params change, reset scroll state (page, limit, search)
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, limit]);

  return (
    <AuthGuardLayout level="authenticated-only">
      {isSuccessConnections && <HelmetTemplate title={`${connections.meta.totalItems} Pending Connections | LinkinPurry`} />}

      <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
        <section className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background shadow-md">
          {/* Header */}
          <header className="flex flex-col gap-2 border-b p-5 sm:gap-0">
            <h1 className="text-lg font-semibold">{isSuccessConnections && <>{connections.meta.totalItems}</>} Pending Connections</h1>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Sorted by: <span className="font-bold">Recently invited</span>
              </p>
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

          {/* Success */}
          {isSuccessConnections && (
            // Empty state
            <div>
              {connections.meta.totalItems === 0 ? (
                <div className="flex min-h-64 items-center justify-center p-5">
                  <p className="text-lg text-muted-foreground">No pending connections</p>
                </div>
              ) : (
                // Data
                <ol>
                  {connections.data.map((con) => {
                    return (
                      <li
                        className="flex flex-col items-start gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:gap-5"
                        key={con.user_id}
                      >
                        <Link to="/users/$userId" params={{ userId: con.user_id }} className="flex flex-auto flex-row items-center gap-3.5">
                          {/* Avatar */}
                          <AvatarUser src={con.profile_photo} alt={`${con.name}'s profile picture`} classNameAvatar="size-14" />

                          <div className="flex-auto">
                            <h2 className="text-xl font-bold text-foreground decoration-2 underline-offset-2 hover:underline">{con.name}</h2>
                            <p className="line-clamp-3 text-sm font-medium text-muted-foreground sm:line-clamp-2">{con.work_history}</p>
                          </div>
                        </Link>

                        {/* Accept or reject Action */}
                        <div className="flex flex-row items-center gap-2 self-end sm:self-auto">
                          {/* Reject */}
                          <DecideDialog type={ConnectionRequestDecision.DECLINE} decideToUserId={con.user_id} decideToUsername={con.username}>
                            <Button className="w-20 rounded-full font-bold" variant={'ghost'} size={'xs'}>
                              Reject
                            </Button>
                          </DecideDialog>

                          {/* Accept */}
                          <DecideDialog type={ConnectionRequestDecision.ACCEPT} decideToUserId={con.user_id} decideToUsername={con.username}>
                            <Button className="w-20 rounded-full font-bold" variant={'outline-primary'} size={'xs'}>
                              Accept
                            </Button>
                          </DecideDialog>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          )}

          {/* Pagination */}
          {isSuccessConnections && connections.meta.totalItems > 0 && (
            <div className="p-5">
              <Pagination>
                <PaginationContent className="flex-wrap gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      to="/my-network/grow"
                      disabled={connections.meta.page === 1}
                      search={{ page: connections.meta.page - 1, limit }}
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
                            <PaginationNumber to="/my-network/grow" isActive={connections.meta.page === idx + 1} search={{ page: idx + 1, limit }}>
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
                            <PaginationNumber to="/my-network/grow" isActive={connections.meta.page === idx + 1} search={{ page: idx + 1, limit }}>
                              {idx + 1}
                            </PaginationNumber>
                          </PaginationItem>
                        );
                      })}

                      <PaginationEllipsis className="hidden md:flex" />

                      <PaginationItem className="hidden md:block">
                        <PaginationNumber
                          to="/my-network/grow"
                          isActive={connections.meta.page === connections.meta.totalPages}
                          search={{
                            page: connections.meta.totalPages,
                            limit,
                          }}
                        >
                          {connections.meta.totalPages}
                        </PaginationNumber>
                      </PaginationItem>
                    </>
                  ) : connections.meta.page > connections.meta.totalPages - 5 ? (
                    // Case Right sided
                    <>
                      <PaginationItem className="hidden md:block">
                        <PaginationNumber to="/my-network/grow" isActive={connections.meta.page === 1} search={{ page: 1, limit }}>
                          1
                        </PaginationNumber>
                      </PaginationItem>

                      <PaginationEllipsis className="hidden md:flex" />

                      {Array.from({ length: 5 }).map((_, idx) => {
                        const pg = connections.meta.totalPages - 5 + 1 + idx;
                        return (
                          <PaginationItem key={idx} className="hidden md:block">
                            <PaginationNumber to="/my-network/grow" isActive={connections.meta.page === pg} search={{ page: pg, limit }}>
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
                        <PaginationNumber to="/my-network/grow" isActive={connections.meta.page === 1} search={{ page: 1, limit }}>
                          1
                        </PaginationNumber>
                      </PaginationItem>

                      <PaginationEllipsis className="hidden md:flex" />

                      {/* Page n-4 elements */}
                      {Array.from({ length: 7 - 4 }).map((_, idx) => {
                        const pg = connections.meta.page - 2 + idx + 1;
                        return (
                          <PaginationItem key={idx} className="hidden md:block">
                            <PaginationNumber to="/my-network/grow" isActive={connections.meta.page === pg} search={{ page: pg, limit }}>
                              {pg}
                            </PaginationNumber>
                          </PaginationItem>
                        );
                      })}

                      <PaginationEllipsis className="hidden md:flex" />

                      {/* Last page elements */}
                      <PaginationItem className="hidden md:block">
                        <PaginationNumber
                          to="/my-network/grow"
                          isActive={connections.meta.page === connections.meta.totalPages}
                          search={{
                            page: connections.meta.totalPages,
                            limit,
                          }}
                        >
                          {connections.meta.totalPages}
                        </PaginationNumber>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      to="/my-network/grow"
                      search={{ page: connections.meta.page + 1, limit }}
                      disabled={connections.meta.page === connections.meta.totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>
      </main>
    </AuthGuardLayout>
  );
}
