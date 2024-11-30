import { createFileRoute } from '@tanstack/react-router';
import { SearchIcon, SquarePen } from 'lucide-react';

import { useState } from 'react';

import { NewChatDialog } from '@/components/messaging/new-chat-dialog';
import { AvatarUser } from '@/components/shared/avatar-user';
import { HelmetTemplate } from '@/components/shared/helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/context/session-provider';
import { useMediaQuery } from '@/hooks/use-mediaquery';
import { AuthGuardLayout } from '@/layouts/auth-guard-layout';
import { inboxMocks } from '@/lib/mocks/inbox';
import { getRelativeTime } from '@/lib/utils';

export const Route = createFileRoute('/messaging/')({
  component: RouteComponent,
});

function RouteComponent() {
  // state (selected chat with userId)
  const [selectedChatUserId, setSelectedChat] = useState<string | null>(null);

  // hooks
  const { session } = useSession();
  const isSm = useMediaQuery('(min-width: 640px');

  return (
    <AuthGuardLayout level="authenticated-only">
      <HelmetTemplate title="Messaging | LinkinPurry" />

      <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
        <section className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background shadow-md">
          {/* Header */}
          <header className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:gap-6">
            <h1 className="text-lg font-semibold">Messaging</h1>

            <div className="flex flex-row items-center gap-3 sm:flex-auto sm:justify-between">
              {/* Search messages */}
              <search className="flex-auto">
                <form
                  className="relative flex flex-1 sm:max-w-64"
                  // onSubmit={handleFormSubmit}
                >
                  <label htmlFor="search-messages" className="sr-only"></label>
                  <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    id="search-messages"
                    placeholder="Search messages"
                    className="h-9 bg-muted pl-9 text-sm"
                    // value={searchInput}
                    // onChange={(e) => {
                    //   setSearchInput(e.target.value);
                    //   debouncedSearchCallback(e.target.value);
                    // }}
                  />
                </form>
              </search>

              {/* New chat dialog */}
              <NewChatDialog>
                <Button size="icon-sm" className="rounded-full" variant="ghost">
                  <SquarePen className="size-6" />
                </Button>
              </NewChatDialog>
            </div>
          </header>

          <div>
            {/* Inbox */}
            {inboxMocks.length === 0 ? (
              <div className="flex h-[576px] w-full items-center justify-center sm:h-[768px] sm:max-w-[312px] sm:border-r">
                <p className="text-base text-muted-foreground">Inbox Empty</p>
              </div>
            ) : (
              <ScrollArea className="h-[576px] w-full sm:h-[768px] sm:max-w-[312px] sm:border-r">
                <ol>
                  {inboxMocks.map((inbox) => (
                    <li className="flex h-24 items-center border-b border-border bg-background px-3.5 transition-colors hover:bg-muted">
                      <button className="flex flex-auto flex-row items-center gap-3" onClick={() => setSelectedChat(inbox.user_id)}>
                        {/* Avatar */}
                        <AvatarUser src={inbox.profile_photo} alt={`${inbox.name}'s profile picture`} classNameAvatar="size-14" />

                        {/* Name & message preview */}
                        <div className="flex flex-auto flex-col self-start text-left">
                          <div className="flex flex-auto flex-row items-center justify-between gap-1">
                            <h2 className="line-clamp-1 text-lg font-semibold text-foreground">{inbox.name}</h2>

                            {/* Time preview */}
                            <p className="text-xs font-medium">{getRelativeTime(new Date(inbox.latest_message_date))}</p>
                          </div>
                          <p className="line-clamp-2 text-sm text-muted-foreground">{inbox.latest_message}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            )}

            {/* Chat view */}
            <div></div>
          </div>
        </section>
      </main>
    </AuthGuardLayout>
  );
}
