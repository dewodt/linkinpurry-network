import { z } from '@hono/zod-openapi';

export const zodPushSubscriptionDto = z.object({
  endpoint: z.string({ message: 'Endpoint must be a string' }).openapi({
    description: 'Endpoint',
    example: 'https://fcm.googleapis.com/fcm/send/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  }),
  expirationTime: z
    .number({ message: 'Expiration time must be a number' })
    .nullable()
    .optional()
    .openapi({
      description: 'Expiration time',
      example: 1679088123,
    }),
  keys: z.object({
    p256dh: z.string({ message: 'P256DH key must be a string' }).openapi({
      description: 'P256DH key',
      example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    }),
    auth: z.string({ message: 'Auth key must be a string' }).openapi({
      description: 'Auth key',
      example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    }),
  }),
});

export interface IPushSubscriptionDto extends z.infer<typeof zodPushSubscriptionDto> {}
