import { CircleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';

interface WarningFillProps {
  message: string;
  className?: string;
}

const WarningFill = ({ message, className }: WarningFillProps) => {
  return (
    <div className={cn('flex flex-auto flex-col items-center justify-center gap-1 text-center text-muted-foreground', className)}>
      <CircleAlert className="size-5" />
      <p className="text-base">{message}</p>
    </div>
  );
};

export { WarningFill };
