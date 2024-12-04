import { useMutation } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from '@/context/session-provider';
import { ConnectionRequestDecision } from '@/lib/enum';
import { queryClient } from '@/lib/query';
import { toTitleCase } from '@/lib/utils';
import { decideConnection } from '@/services/connection';
import { DecideConnectionReqErrorResponse, DecideConnectionReqSuccessResponse } from '@/types/api/connection';

interface DecideDialogProps {
  children: React.ReactNode;

  // types
  type: ConnectionRequestDecision;

  // user data
  decideToUserId: string;
  decideToUsername: string;
}

export function DecideDialog({ children, decideToUserId, decideToUsername, type }: DecideDialogProps) {
  // hooks
  const { session } = useSession();

  const { page } = useSearch({ from: '/my-network/grow/' });

  // states
  const [decideOpen, setDecideOpen] = React.useState(false);

  // Mutation hooks for connect
  const mutation = useMutation<DecideConnectionReqSuccessResponse, DecideConnectionReqErrorResponse>({
    mutationFn: async () => decideConnection({ fromUserId: decideToUserId }, { decision: type }),
    onMutate: () => {
      toast.loading('Loading...', { description: 'Please wait', duration: Infinity });
      setDecideOpen(false);
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.response?.statusText || 'Error', { description: error.response?.data.message || 'An error occurred' });
    },
    onSuccess: (data) => {
      toast.dismiss();
      toast.success('Success', { description: data.message });

      // current user
      // the connection list + number of conn changes
      queryClient.invalidateQueries({
        queryKey: ['users', session?.userId], // prefix
      });

      // the connected user (if fetched before)
      // the connection list + number of conn changes
      queryClient.invalidateQueries({
        queryKey: ['users', decideToUserId],
      });

      // Explore page
      queryClient.invalidateQueries({
        queryKey: ['users', 'explore'],
      });

      // revalidate the query at that exact filter
      queryClient.invalidateQueries({
        queryKey: ['my-networks', page], // prefix
      });
    },
  });

  return (
    <Dialog open={decideOpen} onOpenChange={setDecideOpen}>
      <DialogTrigger asChild disabled={mutation.isPending}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Decide Connection Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to {type} {decideToUsername}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-1">
          <Button type="button" className="rounded-full font-bold" variant="outline-muted" size="sm" onClick={() => setDecideOpen(false)}>
            Cancel
          </Button>

          <Button type="button" className="rounded-full font-bold" size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {toTitleCase(type)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
