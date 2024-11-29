import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

const LoadingFill = ({ className = '' }) => {
  return (
    <div className={cn('flex flex-auto items-center justify-center', className)}>
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
        <p className="text-base font-medium">Loading...</p>
      </div>
    </div>
  );
};

export { LoadingFill };
