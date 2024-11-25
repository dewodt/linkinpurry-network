import { createFileRoute } from '@tanstack/react-router';

// @ts-expect-error - babel resolver
import * as React from 'react';

import { LogInForm } from '@/components/auth/login-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AuthGuardLayout } from '@/layouts/auth-guard-layout';

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthGuardLayout level="unauthenticated-only">
      <main className="flex min-h-[calc(100vh-4rem)] flex-auto items-center justify-center bg-muted p-6 py-12 sm:p-12 lg:p-24">
        <Card className="w-full max-w-sm shadow-md">
          {/* Title */}
          <CardHeader>
            <h1 className="text-center text-2xl font-bold text-primary lg:text-3xl">Login</h1>
          </CardHeader>

          {/* Form */}
          <CardContent>
            <LogInForm />
          </CardContent>
        </Card>
      </main>
    </AuthGuardLayout>
  );
}
