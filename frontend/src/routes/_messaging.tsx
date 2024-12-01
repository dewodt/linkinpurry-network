import { Outlet, createFileRoute } from '@tanstack/react-router';

import * as React from 'react';

import { ChatProvider } from '@/context/chat-provider';
import { AuthGuardLayout } from '@/layouts/auth-guard-layout';

export const Route = createFileRoute('/_messaging')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthGuardLayout level="authenticated-only">
      <ChatProvider>
        <Outlet />
      </ChatProvider>
    </AuthGuardLayout>
  );
}
