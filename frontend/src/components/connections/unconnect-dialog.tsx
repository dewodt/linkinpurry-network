import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSession } from '@/context/session-provider';
import { queryClient } from '@/lib/query';
import { unConnectUser } from '@/services/connection';
import { UnConnectUserErrorResponse, UnConnectUserSuccessResponse } from '@/types/api/connection';

interface UnConnectDialogProps {
  // dialog state
  unConnectOpen: boolean;
  setUnConnectOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // user data
  currentSeenUserId?: string | undefined;

  unConnectToUserId: string;
  unConnectToUsername: string;
}

export function UnConnectDialog({
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
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.response?.statusText || 'Error', { description: error.response?.data.message || 'An error occurred' });
    },
    onSuccess: (data) => {
      toast.dismiss();
      setUnConnectOpen(false);
      toast.success('Success', { description: data.message });

      // current user
      // the connection list + number of conn changes
      queryClient.invalidateQueries({
        queryKey: ['users', session?.userId], // prefix
      });

      // the seen user page (to change to connect again)
      if (currentSeenUserId) {
        // defined for the connections list page,
        // undefined for the profile page (handled by the next section)
        queryClient.invalidateQueries({
          queryKey: ['users', currentSeenUserId, 'connections'],
        });
      }

      // Explore page
      queryClient.invalidateQueries({
        queryKey: ['users', 'explore'],
      });

      // the connected user (if fetched before)
      // the connection list + number of conn changes
      queryClient.invalidateQueries({
        queryKey: ['users', unConnectToUserId], // prefix
      });

      // Invalidate the feed (might cant see his/her fee again)
      queryClient.invalidateQueries({
        queryKey: ['feed', 'timeline'],
      });

      // Chat inbox
      queryClient.invalidateQueries({
        queryKey: ['chats', 'inbox'],
      });

      // Chat history with the user
      queryClient.invalidateQueries({
        queryKey: ['chats', unConnectToUserId, 'content'],
      });
    },
  });

  return (
    <Dialog open={unConnectOpen} onOpenChange={setUnConnectOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove Connection</DialogTitle>
          <DialogDescription>Are you sure you want to remove {unConnectToUsername} from your network?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" className="rounded-full font-bold" variant="outline-muted" size="sm" onClick={() => setUnConnectOpen(false)}>
            Cancel
          </Button>

          <Button
            type="button"
            variant={'destructive'}
            className="rounded-full font-bold"
            size="sm"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
