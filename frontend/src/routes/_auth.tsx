import { Outlet, createFileRoute } from '@tanstack/react-router';

// @ts-expect-error - babel resolver
import * as React from 'react';

import { AuthGuardLayout } from '@/layouts/auth-guard-layout';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthGuardLayout level="unauthenticated-only">
      <Outlet />
    </AuthGuardLayout>
  );
}
