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
import { getMyFeed } from '@/services/feed';
import { GetMyFeedErrorResponse, GetMyFeedSuccessResponse } from '@/types/api/feed';

export const Route = createFileRoute('/my-posts/')({
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
    data: myFeedData,
    error: myFeedError,
    isError: isErrorMyFeed,
    isPending: isPendingMyFeed,
    isFetchingNextPage: isFetchingNextPageMyFeed,
    hasNextPage: hasNextPageMyFeed,
    fetchNextPage: fetchNextPageMyFeed,
    refetch,
  } = useInfiniteQuery<GetMyFeedSuccessResponse, GetMyFeedErrorResponse, InfiniteData<GetMyFeedSuccessResponse>, QueryKey, string | undefined>({
    queryKey: ['feed', 'my'],
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 0,
    initialPageParam: undefined,
    queryFn: async ({ pageParam = undefined }) => {
      return await getMyFeed({ cursor: pageParam, limit: 15 });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.meta.nextCursor || undefined;
    },
  });

  const flattenFeeds = React.useMemo(() => myFeedData?.pages.flatMap((page) => page.data), [myFeedData]) || [];

  // Fetch next page when sentinel is in view
  const debouncedFetchNextPage = useDebouncedCallback(() => {
    if (hasNextPageMyFeed && !isFetchingNextPageMyFeed) {
      fetchNextPageMyFeed();
    }
  }, 300);

  React.useEffect(() => {
    if (feedSentinelInView) {
      debouncedFetchNextPage();
    }
  }, [feedSentinelInView, debouncedFetchNextPage]);

  // Pending
  if (isPendingMyFeed) return <LoadingPage />;

  // Errror
  if (isErrorMyFeed)
    return (
      <ErrorPage
        statusCode={myFeedError?.response?.status}
        statusText={myFeedError.response?.statusText}
        message={myFeedError?.response?.data.message}
        refetch={refetch}
      />
    );

  return (
    <AuthGuardLayout level="authenticated-only">
      <HelmetTemplate title="Feed | LinkinPurry" />

      <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
        <section className="flex w-full max-w-3xl flex-col gap-5">
          {/* Create post */}
          <CreateFeedDialog title="My Posts" />

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
                      fullName={session?.name || ''}
                      username={session?.username || ''}
                      profilePhoto={session?.profilePhoto || ''}
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
                {hasNextPageMyFeed && <LoadingFill className="pt-10" />}
              </li>
            </ol>
          )}
        </section>
      </main>
    </AuthGuardLayout>
  );
}
