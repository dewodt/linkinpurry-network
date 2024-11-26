import { CircleAlert, RotateCw } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

interface ErrorPageProps {
  className?: string;
  statusText?: string;
  message?: string;
  refetch?: () => void;
}

export function ErrorPage({ className, statusText, message, refetch }: ErrorPageProps) {
  return (
    <main className={cn('flex min-h-[calc(100vh-4rem)] flex-auto items-center justify-center bg-muted p-6 py-12 sm:p-12 lg:p-24', className)}>
      <section className="flex flex-col items-center gap-3">
        {/* Texts */}
        <div className="flex flex-col items-center gap-1.5 text-center font-medium text-destructive">
          <div className="flex items-center gap-2">
            <CircleAlert className="size-5" />
            <p className="text-base">{statusText || 'Internal Server Error'}</p>
          </div>
          <p className="text-base">{message || 'An unexpected error occured'}</p>
        </div>

        {/* Refetch */}
        {refetch && (
          <Button variant="destructive" size="sm" className="px-3" onClick={refetch}>
            <RotateCw className="size-4" />
            <span>Retry</span>
          </Button>
        )}
      </section>
    </main>
  );
}
