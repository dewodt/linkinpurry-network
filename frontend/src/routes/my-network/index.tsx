import { createFileRoute } from '@tanstack/react-router';

import * as React from 'react';

export const Route = createFileRoute('/my-network/')({
  component: RouteComponent,
});

function RouteComponent() {
  return 'Hello /my-network/!';
}
