import { createFileRoute } from '@tanstack/react-router';

import { ChatLayout } from '@/layouts/chat-layout';

export const Route = createFileRoute('/_messaging/messaging/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ChatLayout>
      <></>
      {/* Chat header */}

      {/* Chat Content */}

      {/* Send message form */}
    </ChatLayout>
  );
}
