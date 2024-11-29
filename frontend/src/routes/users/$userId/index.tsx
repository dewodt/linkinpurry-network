import { useQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Clock4, Pencil, UserCircle2 } from 'lucide-react';

// @ts-expect-error - babel
import * as React from 'react';

import { ConnectDialog } from '@/components/connections/connect-dialog';
import { LinkedInClockIcon, LinkedInConnectIcon } from '@/components/icons/linkedin-icons';
import { ErrorPage } from '@/components/shared/error-page';
import { LoadingPage } from '@/components/shared/loading-page';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EditProfileDialog } from '@/components/users/update-profile-dialog';
import { useSession } from '@/hooks/use-session';
import { ConnectionStatus } from '@/lib/enum';
import { cn, formatDate } from '@/lib/utils';
import { getProfile } from '@/services/user';
import { GetProfileErrorResponse, GetProfileSuccessResponse } from '@/types/api/user';

export const Route = createFileRoute('/users/$userId/')({
  component: RouteComponent,
});

function RouteComponent() {
  // Hooks
  const { userId } = Route.useParams();
  const { session } = useSession();

  const {
    data: profile,
    isPending: isPendingProfile,
    error: errorProfile,
    isError: isErrorProfile,
    refetch,
  } = useQuery<GetProfileSuccessResponse, GetProfileErrorResponse>({
    queryKey: ['users', userId],
    queryFn: () => getProfile({ userId }),
  });

  if (isPendingProfile) return <LoadingPage />;

  if (isErrorProfile)
    return (
      <ErrorPage
        statusCode={errorProfile?.response?.status}
        statusText={errorProfile.response?.statusText}
        message={errorProfile?.response?.data.message}
        refetch={refetch}
      />
    );

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
      {/* Profile section */}
      <section className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background shadow-md">
        {/*  Background */}
        <div className="relative h-32 bg-primary/25 md:h-48">
          {/* Avatar */}
          <Avatar className="absolute -bottom-[60px] left-7 size-[120px] md:-bottom-[48px] md:size-[152px]">
            <AvatarImage src={profile.data.profile_photo} alt="Profile picture" />
            <AvatarFallback>
              <UserCircle2 className="size-full stroke-gray-500 stroke-[1.5px]" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="relative flex flex-col items-start gap-3 px-6 pb-6 pt-[68px] md:pt-[60px]">
          {/* Edit button (only if userid = session id) */}
          {session && session.userId === userId && (
            <EditProfileDialog initialData={profile.data}>
              <Button size="icon" variant="ghost" className="absolute right-4 top-4 rounded-full text-muted-foreground">
                <Pencil className="size-5" />
              </Button>
            </EditProfileDialog>
          )}

          {/* Texts */}
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-2xl font-bold text-foreground">{profile.data.name}</h1>

            <p className="text-base font-medium text-muted-foreground">@{profile.data.username}</p>

            {/* Connection count */}
            <Link
              to="/users/$userId/connections"
              params={{ userId }}
              className="text-sm font-semibold text-primary decoration-2 underline-offset-2 hover:underline"
            >
              {profile.data.connection_count > 500 ? '500+ connections' : `${profile.data.connection_count} connections`}
            </Link>
          </div>

          {/* Connect / unconnect button (for auth only + not current user) */}
          {session &&
            session.userId !== userId &&
            (profile.data.connection_status === ConnectionStatus.NONE ? (
              <ConnectDialog connectToUserId={userId} connectToUsername={profile.data.username}>
                <Button className="h-8 gap-1.5 rounded-full font-bold" size="sm">
                  <LinkedInConnectIcon className="size-4" />
                  Connect
                </Button>
              </ConnectDialog>
            ) : profile.data.connection_status === ConnectionStatus.PENDING ? (
              <Button
                className="h-8 gap-1.5 rounded-full font-bold disabled:border-muted-foreground disabled:text-muted-foreground disabled:opacity-100 disabled:hover:text-muted-foreground"
                variant="outline"
                size="sm"
                disabled
              >
                <LinkedInClockIcon className="size-4" />
                Pending
              </Button>
            ) : (
              <div className="flex flex-row items-center gap-2">
                {/* Message */}
                <Button className="rounded-full px-5 font-semibold" size="sm">
                  Message
                </Button>

                {/* More (for unconenct) */}
              </div>
            ))}
        </div>
      </section>

      {/* Work experience */}
      <section className="w-full max-w-3xl space-y-1 overflow-hidden rounded-xl border border-border bg-background p-6 shadow-md">
        <h2 className="text-xl font-bold text-foreground">Experience</h2>

        <div>{profile.data.work_history ? <p>{profile.data.work_history}</p> : <p className="text-muted-foreground">No work history added.</p>}</div>
      </section>

      {/* Skills */}
      <section className="w-full max-w-3xl space-y-1 overflow-hidden rounded-xl border border-border bg-background p-6 shadow-md">
        <h2 className="text-xl font-bold text-foreground">Skills</h2>

        <div>{profile.data.skills ? <p>{profile.data.skills}</p> : <p className="text-muted-foreground">No skills added.</p>}</div>
      </section>

      {/* Recent posts */}
      {profile.data.relevant_posts != undefined && (
        <section className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background p-6 shadow-md">
          <h2 className="text-xl font-bold text-foreground">Recent Posts</h2>

          {profile.data.relevant_posts.length > 0 ? (
            <ol>
              {profile.data.relevant_posts.map((post) => {
                const isLast = profile.data.relevant_posts && profile.data.relevant_posts.length - 1;
                return (
                  <li key={post.id} className={cn('border-b py-3', isLast && 'border-b-0 pb-0')}>
                    <article className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-muted-foreground">{formatDate(post.created_at)}</p>
                      <p className="line-clamp-3 text-base text-foreground">{post.content}</p>
                    </article>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div>
              <p className="text-muted-foreground">No posts added.</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
