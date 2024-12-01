import { createFileRoute } from '@tanstack/react-router';

// @ts-expect-error - babel resolver
import * as React from 'react';

import { RegisterForm } from '@/components/auth/register-form';
import { HelmetTemplate } from '@/components/shared/helmet';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const Route = createFileRoute('/_auth/auth/register/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <HelmetTemplate title="Register | LinkinPurry" />

      <main className="flex min-h-[calc(100vh-4rem)] flex-auto items-center justify-center bg-muted p-6 py-12 sm:p-12 lg:p-24">
        <Card className="w-full max-w-sm shadow-md">
          {/* Title */}
          <CardHeader>
            <h1 className="text-center text-2xl font-bold text-primary lg:text-3xl">Register</h1>
          </CardHeader>

          {/* Form */}
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
