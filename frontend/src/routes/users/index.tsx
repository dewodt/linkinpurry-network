import { createFileRoute } from '@tanstack/react-router';

import * as React from 'react';

export const Route = createFileRoute('/users/')({
  component: RouteComponent,
});

function RouteComponent() {
  return 'Hello /users/!';
}
