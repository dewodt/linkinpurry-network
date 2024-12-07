import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

import * as React from 'react';

import CardFeed from '@/components/feed/card-feed';
import { ErrorPage } from '@/components/shared/error-page';
import { HelmetTemplate } from '@/components/shared/helmet';
import { LoadingPage } from '@/components/shared/loading-page';
import { useSession } from '@/context/session-provider';
import { AuthGuardLayout } from '@/layouts/auth-guard-layout';
import { getFeedDetail } from '@/services/feed';
import { GetFeedDetailErrorResponse, GetFeedDetailSuccessResponse } from '@/types/api/feed';

export const Route = createFileRoute('/feed/$feedId/')({
  component: RouteComponent,
});

function RouteComponent() {
  // Get path params
  const { feedId } = Route.useParams();

  // hooks
  const { session } = useSession();
  const router = useRouter();

  // Query
  const {
    data: feedData,
    error: feedError,
    isSuccess: isSuccessFeed,
    isError: isErrorFeed,
    isPending: isPendingFeed,
    refetch,
  } = useQuery<GetFeedDetailSuccessResponse, GetFeedDetailErrorResponse>({
    queryKey: ['feed', feedId, 'detail'],
    queryFn: async () => getFeedDetail({ feedId }),
  });

  // Pending
  if (isPendingFeed) return <LoadingPage />;

  // Errror
  if (isErrorFeed)
    return (
      <ErrorPage
        statusCode={feedError?.response?.status}
        statusText={feedError.response?.statusText}
        message={feedError?.response?.data.message}
        refetch={refetch}
      />
    );

  return (
    <AuthGuardLayout level="authenticated-only">
      {isSuccessFeed && <HelmetTemplate title="Feed Detail | LinkinPurry" />}

      <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
        <section className="flex w-full max-w-3xl flex-col gap-3">
          {/* Back button */}
          <button className="self-start" onClick={() => router.history.back()}>
            <div className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
              <ChevronLeft className="h-4 w-4" />
              Back
            </div>
          </button>

          {/* Feed */}
          <CardFeed
            feedId={feedData.data.feed_id}
            userId={feedData.data.user_id}
            fullName={feedData.data.full_name}
            username={feedData.data.username}
            profilePhoto={feedData.data.profile_photo}
            content={feedData.data.content}
            createdAt={new Date(feedData.data.created_at)}
            editedAt={new Date(feedData.data.updated_at)}
            isDetailOptionVisible={false}
            currentUserId={session?.userId || ''}
          />
        </section>
      </main>
    </AuthGuardLayout>
  );
}
