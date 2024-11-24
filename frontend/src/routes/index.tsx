import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>

      <Input placeholder="lol" />
    </div>
  );
}
