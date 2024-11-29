import { Link } from '@tanstack/react-router';
import { CircleAlert, RotateCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { HelmetTemplate } from './helmet';

interface ErrorFillProps {
  className?: string;
  statusCode?: number;
  statusText?: string;
  message?: string;
  refetch?: () => void;
}

const ErrorFill = ({
  className,
  statusCode = 500,
  statusText = 'Internal Server Error',
  message = 'An unexpected error occured',
  refetch,
}: ErrorFillProps) => {
  return (
    <>
      <HelmetTemplate title={`Error ${statusCode}: ${statusText} | LinkinPurry`} />

      <div className={cn('flex flex-auto items-center justify-center', className)}>
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-1 text-center text-base">
            <div className="flex items-center gap-2">
              <CircleAlert className="size-5" />
              <p className="font-bold text-foreground">{statusText}</p>
            </div>
            <p className="text-muted-foreground">{message}</p>
          </div>

          {/* Action button */}
          {statusCode === 404 ? (
            <Link to="/">
              <Button size="sm" className="px-4">
                Go Back Home
              </Button>
            </Link>
          ) : statusCode === 401 ? (
            <Link to="/auth/login">
              <Button size="sm" className="px-4">
                Login
              </Button>
            </Link>
          ) : (
            refetch && (
              <Button size="sm" className="px-4" onClick={refetch}>
                <RotateCw className="size-4" />
                <span>Retry</span>
              </Button>
            )
          )}
        </div>
      </div>
    </>
  );
};

export { ErrorFill };
