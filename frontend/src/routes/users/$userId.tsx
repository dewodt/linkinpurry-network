import { queryOptions } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Pencil, UserCircle2 } from 'lucide-react';

// @ts-expect-error - babel
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';

// const profileQueryOptions = (userId: string) =>
//   queryOptions({
//     queryKey: ['users', userId],
//     queryFn: () => {

//     }
//   });

export const Route = createFileRoute('/users/$userId')({
  component: RouteComponent,
  // loader: ({ params: { userId } }) => ({
  //   // Pre-fetch user data and feed it to React Query
  //   queryKey: ['users', userId],
  //   queryFn: () => fetchUser(userId),
  // }),
});

function RouteComponent() {
  // const { userId } = Route.useParams();

  const recentPosts = [
    {
      id: '1',
      content:
        'Hello World 1 from Dewantoro Triatmojo Hello World 1 from Dewantoro Triatmojo Hello World 1 from Dewantoro Triatmojo Hello World 1 from Dewantoro Triatmojo Hello World 1 from Dewantoro Triatmojo Hello World 1 from Dewantoro Triatmojo Hello World 1 from Dewantoro Triatmojo',
      createdAt: '2021-10-10T00:00:00Z',
    },
    {
      id: '2',
      content: 'Hello World 2 from Dewantoro Triatmojo',
      createdAt: '2021-10-10T00:00:00Z',
    },
  ];

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
      {/* Profile section */}
      <section className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background shadow-md">
        {/*  Background */}
        <div className="relative h-32 bg-primary/25 md:h-48">
          {/* Avatar */}
          <Avatar className="absolute -bottom-[60px] left-7 size-[120px] md:-bottom-[48px] md:size-[152px]">
            <AvatarImage
              src={'http://localhost:3000/bucket/avatar/dbce971e-d860-4863-8868-5eb9a1c0fc69_1_10_2024_zoomed.jpg'}
              alt="Profile picture"
            />
            <AvatarFallback>
              <UserCircle2 className="size-full stroke-gray-500 stroke-[1.5px]" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="relative flex flex-col items-start gap-3 px-6 pb-6 pt-[68px] md:pt-[60px]">
          {/* Edit button */}
          <Button size="icon" variant="ghost" className="absolute right-4 top-4 rounded-full text-muted-foreground">
            <Pencil className="size-5" />
          </Button>

          {/* Texts */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Dewantoro Triatmojo</h1>

            <p className="text-base font-medium text-muted-foreground">@dewodt</p>

            {/* Connection count */}
            <p className="text-base font-semibold text-primary">300+ connections</p>
          </div>

          {/* Connect / unconnect button */}
          <Button className="rounded-full px-5 font-semibold" size="sm">
            Connect
          </Button>
        </div>
      </section>

      {/* Work experience */}
      <section className="w-full max-w-3xl space-y-1 overflow-hidden rounded-xl border border-border bg-background p-6 shadow-md">
        <h2 className="text-xl font-bold text-foreground">Experience</h2>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec dui ac nunc ultricies fermentum. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit. Nullam nec dui ac nunc ultricies fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec dui ac nunc
          ultricies fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec dui ac nunc ultricies fermentum.
        </p>
      </section>

      {/* Skills */}
      <section className="w-full max-w-3xl space-y-1 overflow-hidden rounded-xl border border-border bg-background p-6 shadow-md">
        <h2 className="text-xl font-bold text-foreground">Skills</h2>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec dui ac nunc ultricies fermentum. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit. Nullam nec dui ac nunc ultricies fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec dui ac nunc
          ultricies fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec dui ac nunc ultricies fermentum.
        </p>
      </section>

      {/* Recent posts */}
      <section className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background p-6 shadow-md">
        <h2 className="text-xl font-bold text-foreground">Recent Posts</h2>

        <ol>
          {recentPosts.map((post, idx) => (
            <li key={post.id} className={cn('border-b py-3', idx === recentPosts.length - 1 && 'border-b-0 pb-0')}>
              <article className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">{formatDate(post.createdAt)}</p>
                <p className="line-clamp-3 text-base text-foreground">{post.content}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
