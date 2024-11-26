import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface LoadingPageProps {
  className?: string;
}

export function LoadingPage({ className }: LoadingPageProps) {
  return (
    <main className={cn('flex min-h-[calc(100vh-4rem)] flex-auto items-center justify-center bg-muted p-6 py-12 sm:p-12 lg:p-24', className)}>
      <section className="flex flex-row items-center gap-2.5 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <p className="text-base font-medium">Loading...</p>
      </section>
    </main>
  );
}
