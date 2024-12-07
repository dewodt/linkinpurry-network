import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/context/session-provider';
import { cn } from '@/lib/utils';

import { AvatarUser } from '../shared/avatar-user';

interface CreateFeedDialogProps {
  className?: string;
}

export default function CreateFeedDialog({ className }: CreateFeedDialogProps) {
  // hooks
  const { session } = useSession();

  // State
  const [open, setOpen] = React.useState(false);

  return (
    <Card className={cn(className)}>
      <CardContent className="space-y-0 p-6">
        <div className="flex items-center gap-4">
          <AvatarUser src={session?.profilePhoto || ''} alt={`${session?.name}'s Avatar`} classNameAvatar="size-10" />

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="flex-auto">
              <Input className="pointer-events-none h-10 rounded-full bg-muted px-5" placeholder="Create new post" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader className="flex flex-row items-center border-b pb-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  <DialogTitle className="text-base">Dewantoro Triatmojo</DialogTitle>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea className="min-h-[120px] resize-none border-0 focus-visible:ring-0" placeholder="What do you want to talk about?" />
                <div className="flex items-center justify-end border-t pt-4">
                  <Button className="rounded-full px-4" size="sm">
                    Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
