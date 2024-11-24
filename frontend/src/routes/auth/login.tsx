import { createFileRoute } from '@tanstack/react-router';

import * as React from 'react';

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return 'Hello /auth/login!';
}
