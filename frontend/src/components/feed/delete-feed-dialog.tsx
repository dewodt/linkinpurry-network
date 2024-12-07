import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSession } from '@/context/session-provider';
import { queryClient } from '@/lib/query';
import { deleteFeed } from '@/services/feed';
import { DeleteFeedErrorResponse, DeleteFeedSuccessResponse } from '@/types/api/feed';

interface DeleteFeedDialogProps {
  // params
  feedId: string;

  // Dialog state
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Event handlers
  onSuccess?: () => void;
}

export function DeleteFeedDialog({ feedId, isDeleteDialogOpen, setIsDeleteDialogOpen, onSuccess }: DeleteFeedDialogProps) {
  // hooks
  const { session } = useSession();

  // Mutation hooks for connect
  const mutation = useMutation<DeleteFeedSuccessResponse, DeleteFeedErrorResponse>({
    mutationFn: async () => deleteFeed({ feedId }),
    onMutate: () => {
      toast.loading('Loading...', { description: 'Please wait', duration: Infinity });
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.response?.statusText || 'Error', { description: error.response?.data.message || 'An error occurred' });
    },
    onSuccess: (data) => {
      // toast & dialog close
      toast.dismiss();
      setIsDeleteDialogOpen(false);
      toast.success('Success', { description: data.message });

      // invalidate querys
      // my posts
      queryClient.invalidateQueries({
        queryKey: ['feed', 'my'],
      });

      // home (feeds)
      queryClient.invalidateQueries({
        queryKey: ['feed', 'timeline'],
      });

      // my profile
      queryClient.invalidateQueries({
        queryKey: ['users', session?.userId],
      });

      // Additional callback
      if (onSuccess) {
        onSuccess();
      }
    },
  });

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Post</DialogTitle>
          <DialogDescription>Are you sure you want to delete this post?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" className="rounded-full font-bold" variant="outline-muted" size="sm" onClick={() => setIsDeleteDialogOpen(false)}>
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
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
