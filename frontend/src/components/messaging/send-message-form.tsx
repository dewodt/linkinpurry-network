import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import React from 'react';

import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { sendMessageRequestData } from '@/lib/schemas/chat';
import { sendMessage, updateSendMessageQueryDataInbox, updateSendMessageQueryDataMessage } from '@/services/chat';
import { SendMessageErrorResponse, SendMessageRequestData, SendMessageSuccessResponse } from '@/types/api/chat';

import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface SendMessageFormProps {
  scrollToBottomSmooth: () => void;
}

export function SendMessageForm({ scrollToBottomSmooth }: SendMessageFormProps) {
  // hooks
  const searchParams = useSearch({ from: '/messaging/' });
  const queryClient = useQueryClient();

  const form = useForm<SendMessageRequestData>({
    resolver: zodResolver(sendMessageRequestData),
    defaultValues: {
      to_user_id: searchParams.withUserId,
      message: '',
    },
  });

  const { control, handleSubmit } = form;

  // Mutations
  const mutation = useMutation<SendMessageSuccessResponse, SendMessageErrorResponse, SendMessageRequestData>({
    mutationFn: async (data) => sendMessage(data),
    onError: (error) => {
      toast.error(error.response?.statusText || 'Error', { description: error.response?.data.message || 'An error occurred' });
    },
    onSuccess: async (response) => {
      // Reset form
      form.reset({
        to_user_id: searchParams.withUserId,
        message: '',
      });

      // Update inbox query data
      updateSendMessageQueryDataInbox(queryClient, response.data);

      // Update chat message query data
      updateSendMessageQueryDataMessage(queryClient, response.data);

      // Scroll bottom & focus again
      await new Promise((resolve) => setTimeout(resolve, 25));
      scrollToBottomSmooth();
    },
  });

  // Everytime chat changes
  React.useEffect(() => {
    // Reset form
    if (searchParams.withUserId) {
      form.reset({
        to_user_id: searchParams.withUserId,
        message: '',
      });
    } else {
      form.reset({
        to_user_id: '',
        message: '',
      });
    }

    const timeoutId = setTimeout(() => {
      form.setFocus('message');
    }, 25);
    return () => clearTimeout(timeoutId);
  }, [searchParams.withUserId, form]);

  // handlers
  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit((val) => mutation.mutate(val))();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit((val) => mutation.mutate(val))} className="flex flex-col gap-3 border-t-2 p-4">
        {/* Text area */}
        <FormField
          control={control}
          disabled={mutation.isPending}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Write a message..." className="max-h-52 bg-muted" onKeyDown={handleEnter} {...field}></Textarea>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="flex flex-auto justify-end">
          <Button type="submit" variant="default" size="xs" className="rounded-full px-3.5">
            Send
          </Button>
        </div>
      </form>
    </Form>
  );
}