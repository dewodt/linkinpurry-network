import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import React from 'react';

import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { sendMessageRequestData } from '@/lib/schemas/chat';
import { sendMessage, sendStopTyping, sendTyping, updateSendMessageQueryDataInbox, updateSendMessageQueryDataMessage } from '@/services/chat';
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

  const { control, handleSubmit, watch } = form;

  const isTypingRef = React.useRef(false);
  const stopTypingTimeoutRef = React.useRef<number>();

  // Watch message field for changes
  const message = watch('message');

  // Handle typing status
  const handleTyping = React.useCallback(() => {
    if (!searchParams.withUserId) return;

    // Clear any existing timeout
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }
    // Only send typing event if we weren't already typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping({ to_user_id: searchParams.withUserId });
    }

    // Set new timeout for stop typing
    stopTypingTimeoutRef.current = setTimeout(() => {
      if (!isTypingRef.current || !searchParams.withUserId) return;

      sendStopTyping({ to_user_id: searchParams.withUserId });
      isTypingRef.current = false;
    }, 1000);
  }, [searchParams.withUserId]);

  // Watch for message changes
  React.useEffect(() => {
    if (message) {
      handleTyping();
    }

    return () => {
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
    };
  }, [message, handleTyping]);

  // Clean up on unmount or chat change
  React.useEffect(() => {
    return () => {
      if (isTypingRef.current && searchParams.withUserId) {
        sendStopTyping({ to_user_id: searchParams.withUserId });
        isTypingRef.current = false;
      }
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
    };
  }, [searchParams.withUserId]);

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

      // Stop typing indicator
      if (isTypingRef.current && searchParams.withUserId) {
        sendStopTyping({ to_user_id: searchParams.withUserId });
        isTypingRef.current = false;
      }
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }

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
                <Textarea placeholder="Write a message..." className="max-h-52 bg-muted" onKeyDown={handleEnter} {...field} />
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
