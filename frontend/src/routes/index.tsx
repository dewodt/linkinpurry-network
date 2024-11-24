import { createFileRoute } from '@tanstack/react-router';

import * as React from 'react';

import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <main className="flex min-h-[200vh] flex-auto">
      <h3>Welcome Home!</h3>

      <Input placeholder="lol" />
    </main>
  );
}
