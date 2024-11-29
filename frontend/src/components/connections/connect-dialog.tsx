import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from '@/hooks/use-session';
import { queryClient } from '@/lib/query';
import { connectUser } from '@/services/connection';
import { ConnectUserErrorResponse, ConnectUserSuccessResponse } from '@/types/api/connection';

interface ConnectDialogProps {
  children: React.ReactNode;

  // user data
  currentSeenUserId?: string | undefined;
  connectToUserId: string;
  connectToUsername: string;
}
export function ConnectDialog({ children, currentSeenUserId, connectToUserId, connectToUsername }: ConnectDialogProps) {
  // hooks
  const { session } = useSession();

  // states
  const [connectOpen, setConnectOpen] = React.useState(false);

  // Mutation hooks for connect
  const mutation = useMutation<ConnectUserSuccessResponse, ConnectUserErrorResponse>({
    mutationFn: async () => connectUser({ toUserId: connectToUserId }),
    onMutate: () => {
      toast.loading('Loading...', { description: 'Please wait', duration: Infinity });
      setConnectOpen(false);
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.response?.statusText || 'Error', { description: error.response?.data.message || 'An error occurred' });
    },
    onSuccess: (data) => {
      toast.dismiss();
      toast.success('Success', { description: data.message });

      // invalidateQueries() is much easier than setQueryData() for pagination data

      // current user
      // the connection list + number of conn changes
      queryClient.invalidateQueries({
        queryKey: ['users', session?.userId, 'connections'],
      });
      queryClient.invalidateQueries({
        queryKey: ['users', session?.userId],
      });

      // the seen user (to change from connect to message)
      if (currentSeenUserId) {
        // defined for the connections list page,
        // undefined for the profile page (handled by the next section)
        queryClient.invalidateQueries({
          queryKey: ['users', currentSeenUserId, 'connections'],
        });
      }

      // the connected user (if fetched before)
      // the connection list + number of conn changes
      queryClient.invalidateQueries({
        queryKey: ['users', connectToUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['users', connectToUserId, 'connections'],
      });
    },
  });

  return (
    <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
      <DialogTrigger asChild disabled={mutation.isPending}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to {connectToUsername}</DialogTitle>
          <DialogDescription>Connect to {connectToUsername} to see their posts and chat with them.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            className="gap-1.5 rounded-full border-muted-foreground font-bold text-muted-foreground hover:text-muted-foreground"
            variant="outline"
            size="sm"
            onClick={() => setConnectOpen(false)}
          >
            Cancel
          </Button>

          <Button type="button" className="rounded-full font-bold" size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
