import { createFileRoute, useSearch } from '@tanstack/react-router';

import { ChatContent } from '@/components/messaging/chat-content';
import { ChatHeader } from '@/components/messaging/chat-header';
import { ChatInbox } from '@/components/messaging/chat-inbox';
import { HelmetTemplate } from '@/components/shared/helmet';
import { useMediaQuery } from '@/hooks/use-mediaquery';
import { AuthGuardLayout } from '@/layouts/auth-guard-layout';
import { chatQuery } from '@/lib/schemas/chat';

export const Route = createFileRoute('/messaging/')({
  component: RouteComponent,
  validateSearch: (search) => chatQuery.parse(search),
});

function RouteComponent() {
  //  hooks
  const searchParams = useSearch({ from: '/messaging/' });
  const isMinimumSmViewport = useMediaQuery('(min-width: 640px');

  return (
    <AuthGuardLayout level="authenticated-only">
      <HelmetTemplate title="Messaging | LinkinPurry" />

      <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
        <section className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          {/* Header */}
          <ChatHeader />

          <div className="flex h-[576px] flex-row sm:h-[768px]">
            {/* Inbox */}
            {(isMinimumSmViewport || (!isMinimumSmViewport && !searchParams.withUserId)) && <ChatInbox />}

            {/* Chat view */}
            {searchParams.withUserId && <ChatContent />}
          </div>
        </section>
      </main>
    </AuthGuardLayout>
  );
}
