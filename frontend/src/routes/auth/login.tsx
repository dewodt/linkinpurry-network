import { createFileRoute } from '@tanstack/react-router';

// @ts-expect-error - babel resolver
import * as React from 'react';

import { LogInForm } from '@/components/auth/login-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-auto items-center justify-center bg-muted p-6 py-12 sm:p-12 lg:p-24">
      <Card className="w-full max-w-sm shadow-md">
        {/* Title */}
        <CardHeader>
          <h1 className="text-center text-3xl font-bold text-primary">Sign In</h1>
        </CardHeader>

        <CardContent>
          <LogInForm />
        </CardContent>
      </Card>
    </main>
  );
}
