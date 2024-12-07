import { InfiniteData, QueryKey, useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useInView } from 'react-intersection-observer';
import { useDebouncedCallback } from 'use-debounce';

import * as React from 'react';

import CardFeed from '@/components/feed/card-feed';
import CreateFeedDialog from '@/components/feed/create-feed-dialog';
import { ErrorPage } from '@/components/shared/error-page';
import { HelmetTemplate } from '@/components/shared/helmet';
import { LoadingFill } from '@/components/shared/loading-fill';
import { LoadingPage } from '@/components/shared/loading-page';
import { useSession } from '@/context/session-provider';
import { AuthGuardLayout } from '@/layouts/auth-guard-layout';
import { getFeedTimeline } from '@/services/feed';
import { GetFeedTimelineErrorResponse, GetFeedTimelineSuccessResponse } from '@/types/api/feed';

export const Route = createFileRoute('/feed/')({
  component: RouteComponent,
});

function RouteComponent() {
  // hooks
  const { session } = useSession();

  // Intersection observer hook
  const { ref: feedSentinelRef, inView: feedSentinelInView } = useInView({
    threshold: 0.5,
  });

  // Infinite query
  const {
    data: feedTimelineData,
    error: feedTimelineError,
    isSuccess: isSuccessFeedTimeline,
    isError: isErrorFeedTimeline,
    isPending: isPendingFeedTimeline,
    isFetchingNextPage: isFetchingNextPageFeedTimeline,
    hasNextPage: hasNextPageFeedTimeline,
    fetchNextPage: fetchNextPageFeedTimeline,
    refetch,
  } = useInfiniteQuery<
    GetFeedTimelineSuccessResponse,
    GetFeedTimelineErrorResponse,
    InfiniteData<GetFeedTimelineSuccessResponse>,
    QueryKey,
    string | undefined
  >({
    queryKey: ['feed', 'timeline'],
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 0,
    initialPageParam: undefined,
    queryFn: async ({ pageParam = undefined }) => {
      return await getFeedTimeline({ cursor: pageParam, limit: 15 });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.meta.nextCursor || undefined;
    },
  });

  const flattenFeeds = React.useMemo(() => feedTimelineData?.pages.flatMap((page) => page.data.data), [feedTimelineData]) || [];

  // Fetch next page when sentinel is in view
  const debouncedFetchNextPage = useDebouncedCallback(() => {
    if (hasNextPageFeedTimeline && !isFetchingNextPageFeedTimeline) {
      fetchNextPageFeedTimeline();
    }
  }, 300);

  React.useEffect(() => {
    if (feedSentinelInView) {
      debouncedFetchNextPage();
    }
  }, [feedSentinelInView, debouncedFetchNextPage]);

  // Pending
  if (isPendingFeedTimeline) return <LoadingPage />;

  // Errror
  if (isErrorFeedTimeline)
    return (
      <ErrorPage
        statusCode={feedTimelineError?.response?.status}
        statusText={feedTimelineError.response?.statusText}
        message={feedTimelineError?.response?.data.message}
        refetch={refetch}
      />
    );

  return (
    <AuthGuardLayout level="authenticated-only">
      {isSuccessFeedTimeline && <HelmetTemplate title="Feed | LinkinPurry" />}

      <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
        <section className="flex w-full max-w-3xl flex-col gap-5">
          {/* Create post */}
          <CreateFeedDialog />

          {flattenFeeds.length === 0 ? (
            // Empty state
            <div className="flex min-h-64 items-center justify-center p-5">
              <p className="text-lg text-muted-foreground">Feed is empty</p>
            </div>
          ) : (
            // Feed list
            <ol className="flex flex-col gap-5">
              {flattenFeeds.map((feed) => {
                return (
                  <li key={feed.feed_id}>
                    <CardFeed
                      feedId={feed.feed_id}
                      userId={feed.user_id}
                      fullName={feed.full_name}
                      username={feed.username}
                      profilePhoto={feed.profile_photo}
                      content={feed.content}
                      createdAt={new Date(feed.created_at)}
                      editedAt={new Date(feed.updated_at)}
                      currentUserId={session?.userId || ''}
                    />
                  </li>
                );
              })}

              {/* Sentinel */}
              <li ref={feedSentinelRef} className="flex items-center justify-center">
                {hasNextPageFeedTimeline && <LoadingFill className="pt-10" />}
              </li>
            </ol>
          )}
        </section>
      </main>
    </AuthGuardLayout>
  );
}
