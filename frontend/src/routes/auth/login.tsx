import { createFileRoute } from '@tanstack/react-router';

import * as React from 'react';

import { LoginForm } from '@/components/login-form';

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <LoginForm />
    </div>
  );
  // return 'Hello /auth/login!';
}

// export function Page() {
//   return (
//     <div className="flex h-screen w-full items-center justify-center px-4">
//       <LoginForm />
//     </div>
//   )
// }
