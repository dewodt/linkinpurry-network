import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import * as React from 'react';

import RootLayout from '@/layouts/root-layout';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      {/* Root layouting */}
      <RootLayout>
        <Outlet />
      </RootLayout>

      {/* Devtools (development mode only) */}
      <DevTools />
    </>
  );
}

function DevTools() {
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) return <></>;

  return (
    <>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
