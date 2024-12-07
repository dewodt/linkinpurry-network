import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/context/session-provider';
import { createFeedRequestBody } from '@/lib/schemas/feed';
import { createFeed } from '@/services/feed';
import { CreateFeedErrorResponse, CreateFeedRequestBody, CreateFeedSuccessResponse } from '@/types/api/feed';

import { AvatarUser } from '../shared/avatar-user';

interface CreateFeedDialogProps {
  children: React.ReactNode;
}

export default function CreateFeedDialog({ children }: CreateFeedDialogProps) {
  // State
  const [open, setOpen] = React.useState(false);

  // hooks
  const { session } = useSession();
  const queryClient = useQueryClient();

  // mutation
  const mutation = useMutation<CreateFeedSuccessResponse, CreateFeedErrorResponse, CreateFeedRequestBody>({
    mutationFn: async (val) => createFeed(val),
    onMutate: () => {
      toast.loading('Loading...', { description: 'Please wait', duration: Infinity });
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.response?.statusText || 'Error', { description: error.response?.data.message || 'An error occurred' });

      const errorFields = error.response?.data.errorFields;
      if (errorFields) {
        errorFields.forEach((field) => {
          form.setError(field.field as keyof CreateFeedRequestBody, { message: field.message });
        });
      }
    },
    onSuccess: (data) => {
      toast.dismiss();
      toast.success('Success', { description: data.message });

      // close dialog
      setOpen(false);

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

      // reset dirty state
      form.reset({
        content: '',
      });
    },
  });

  // form hooks
  const form = useForm<CreateFeedRequestBody>({
    resolver: zodResolver(createFeedRequestBody),
    defaultValues: {
      content: '',
    },
  });

  const { control, handleSubmit } = form;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex-auto">{children}</DialogTrigger>
      <DialogContent className="gap-0 space-y-0 sm:max-w-[525px]">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center space-y-0 border-b pb-4">
          <div className="flex items-center gap-4">
            <AvatarUser src={session?.profilePhoto || ''} alt={`${session?.name}'s Profile photo`} classNameAvatar="size-12" />

            <div>
              <DialogTitle className="text-base">{session?.name}</DialogTitle>
              <p className="text-sm font-medium text-muted-foreground">@{session?.username}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={handleSubmit((val) => mutation.mutate(val))} className="flex flex-col gap-5">
            {/* Identifier */}
            <FormField
              control={control}
              disabled={mutation.isPending}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      className="min-h-[150px] resize-none border-0 p-0 px-2 py-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="What do you want to talk about?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end border-t pt-4">
              <Button className="rounded-full px-5" size="sm" type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
