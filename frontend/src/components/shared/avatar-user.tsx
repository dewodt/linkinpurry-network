import { UserCircle2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarUserProps {
  src: string;
  alt: string;
  classNameAvatar?: string;
  classNameAvatarFallback?: string;
}

export function AvatarUser({ src, alt, classNameAvatar, classNameAvatarFallback }: AvatarUserProps) {
  return (
    <Avatar className={cn('size-14', classNameAvatar)}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>
        <UserCircle2 className={cn('size-full stroke-gray-500 stroke-[1.25px]', classNameAvatarFallback)} />
      </AvatarFallback>
    </Avatar>
  );
}
