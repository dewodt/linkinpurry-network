import { QueryClientProvider } from '@tanstack/react-query';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

// @ts-expect-error - babel resolver
import * as React from 'react';

import { SessionProvider } from '@/context/session-provider';
import { ThemeProvider } from '@/context/theme-provider';
import RootLayout from '@/layouts/root-layout';
import { Config } from '@/lib/config';
import { queryClient } from '@/lib/query';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      {/* Register providers + root layout */}
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ThemeProvider defaultTheme="light" storageKey="linkinpurry-theme">
            <RootLayout>
              <Outlet />
            </RootLayout>
          </ThemeProvider>
        </SessionProvider>
      </QueryClientProvider>

      {/* Devtools (development mode only) */}
      <DevTools />
    </>
  );
}

function DevTools() {
  const isDev = Config.getInstance().get('NODE_ENV') === 'development';

  if (!isDev) return <></>;

  return (
    <>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
