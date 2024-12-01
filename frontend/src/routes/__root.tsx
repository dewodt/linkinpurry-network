import { QueryClientProvider } from '@tanstack/react-query';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { HelmetProvider } from 'react-helmet-async';

// @ts-expect-error - babel resolver
import * as React from 'react';

import { ErrorPage } from '@/components/shared/error-page';
import { SessionProvider } from '@/context/session-provider';
import { ThemeProvider } from '@/context/theme-provider';
import RootLayout from '@/layouts/root-layout';
import { Config } from '@/lib/config';
import { queryClient } from '@/lib/query';

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <ErrorPage statusCode={404} statusText="Page Not Found" message="The page you are looking for doesn't exists" />,
});

function RootComponent() {
  return (
    <>
      {/* Register providers + root layout */}
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <ThemeProvider defaultTheme="light" storageKey="linkinpurry-theme">
              <RootLayout>
                <Outlet />
              </RootLayout>
            </ThemeProvider>
          </SessionProvider>
        </QueryClientProvider>
      </HelmetProvider>

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
