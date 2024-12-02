import { z } from 'zod';

/**
 * Send message schema
 */
export const sendMessageRequestData = z.object({
  to_user_id: z.string({ description: 'User ID to send the message to' }).min(1, { message: 'User ID is required' }),
  message: z.string({ description: 'Message to send' }).min(1, { message: 'Message is required' }),
});
