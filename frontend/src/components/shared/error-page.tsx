import { Link } from '@tanstack/react-router';
import { CircleAlert, FileQuestion, RotateCw } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { HelmetTemplate } from './helmet';

interface ErrorPageProps {
  className?: string;
  statusCode?: number;
  statusText?: string;
  message?: string;
  refetch?: () => void;
}

export function ErrorPage({
  className,
  statusCode = 500,
  statusText = 'Internal Server Error',
  message = 'An unexpected error occured',
  refetch,
}: ErrorPageProps) {
  return (
    <>
      <HelmetTemplate title={`Error ${statusCode}: ${statusText} | LinkinPurry`} />

      <main className={cn('flex min-h-[calc(100vh-4rem)] flex-auto items-center justify-center bg-muted p-6 py-12 sm:p-12 lg:p-24', className)}>
        <section className="flex w-full max-w-md">
          <Card className="w-full justify-center px-9 py-14">
            <div className="flex flex-col items-center gap-4 text-center">
              {/* Icon */}
              {statusCode === 404 ? (
                <FileQuestion className="size-24 text-muted-foreground" />
              ) : (
                <CircleAlert className="size-20 text-muted-foreground" />
              )}

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{statusText}</h1>
                <p className="text-lg text-muted-foreground">{message}</p>
              </div>

              {/* Action button */}
              {statusCode === 404 ? (
                <Link to="/">
                  <Button className="px-6" variant="default">
                    Go Back Home
                  </Button>
                </Link>
              ) : statusCode === 401 ? (
                <Link to="/auth/login">
                  <Button className="px-6" variant="default">
                    Login
                  </Button>
                </Link>
              ) : (
                refetch && (
                  <Button className="px-6" variant="default" onClick={refetch}>
                    <RotateCw className="size-4" />
                    Retry
                  </Button>
                )
              )}
            </div>
          </Card>
        </section>
      </main>
    </>
  );
}
