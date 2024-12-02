import { createFileRoute } from '@tanstack/react-router';

import { ChatContent } from '@/components/messaging/chat-content';
import { SendMessageForm } from '@/components/messaging/send-message-form';
import { ChatLayout } from '@/layouts/chat-layout';

export const Route = createFileRoute('/_messaging/messaging/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ChatLayout>
      <ChatContent />
    </ChatLayout>
  );
}
