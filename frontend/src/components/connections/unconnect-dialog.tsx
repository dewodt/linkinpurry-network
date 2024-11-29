import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from '@/hooks/use-session';
import { queryClient } from '@/lib/query';
import { unConnectUser } from '@/services/connection';
import { UnConnectUserErrorResponse, UnConnectUserSuccessResponse } from '@/types/api/connection';

interface UnConnectDialogProps {
  children: React.ReactNode;

  // dialog state
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  unConnectOpen: boolean;
  setUnConnectOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // user data
  currentSeenUserId?: string | undefined;

  unConnectToUserId: string;
  unConnectToUsername: string;
}

export function UnConnectDialog({
  children,
  setDropdownOpen,
  unConnectOpen,
  setUnConnectOpen,
  currentSeenUserId,
  unConnectToUserId,
  unConnectToUsername,
}: UnConnectDialogProps) {
  // hooks
  const { session } = useSession();

  // Mutation hooks for connect
  const mutation = useMutation<UnConnectUserSuccessResponse, UnConnectUserErrorResponse>({
    mutationFn: async () => unConnectUser({ toUserId: unConnectToUserId }),
    onMutate: () => {
      toast.loading('Loading...', { description: 'Please wait', duration: Infinity });
      setUnConnectOpen(false);
      setDropdownOpen(false);
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
        queryKey: ['users', session?.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['users', session?.userId, 'connections'],
      });

      // the seen user page (to change to connect again)
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
        queryKey: ['users', unConnectToUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['users', unConnectToUserId, 'connections'],
      });
    },
  });

  return (
    <Dialog open={unConnectOpen} onOpenChange={setUnConnectOpen}>
      <DialogTrigger asChild disabled={mutation.isPending}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unconnect to {unConnectToUsername}</DialogTitle>
          <DialogDescription>You will have to reconnect to {unConnectToUsername} to see their posts and chat with them.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            className="gap-1.5 rounded-full border-muted-foreground px-4 font-bold text-muted-foreground hover:text-muted-foreground"
            variant="outline"
            size="sm"
            onClick={() => {
              setUnConnectOpen(false);
              setDropdownOpen(false);
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            className="rounded-full px-4 font-bold"
            size="sm"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            Unconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
