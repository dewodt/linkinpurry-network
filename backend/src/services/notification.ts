import type { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import webpush, { WebPushError } from 'web-push';

import { Config } from '@/core/config';
import { InternalServerErrorException } from '@/core/exception';
import { logger } from '@/core/logger';
import { Database } from '@/infrastructures/database/database';

@injectable()
export class NotificationService {
  // IoC key
  static readonly Key = Symbol.for('NotificationService');

  private prisma: PrismaClient;

  constructor(
    @inject(Config.Key) private readonly config: Config,
    @inject(Database.Key) private readonly database: Database
  ) {
    webpush.setVapidDetails(
      this.config.get('PUSH_NOTIFICATION_SUBJECT'),
      this.config.get('VAPID_PUBLIC_KEY'),
      this.config.get('VAPID_PRIVATE_KEY')
    );

    this.prisma = this.database.getPrisma();
  }

  /**
   * Saves a subscription to the database
   */
  async saveSubscription(currentUserId: bigint, subscription: webpush.PushSubscription) {
    try {
      const newSubscription = await this.prisma.pushSubscription.create({
        data: {
          endpoint: subscription.endpoint,
          userId: currentUserId,
          keys: subscription.keys,
        },
      });

      return newSubscription;
    } catch (error) {
      if (error instanceof Error) console.error(error.message);

      throw new InternalServerErrorException('Failed to save subscription');
    }
  }

  /**
   *
   */
  async sendNotificationToUser<T>(toUserId: bigint, payload: T) {
    try {
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: {
          userId: toUserId,
        },
      });

      const notificationsPromise = subscriptions.map(async (sub) => {
        return webpush
          .sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys as any,
            },
            JSON.stringify(payload)
          )
          .catch((err) => {
            if (err instanceof WebPushError && err.statusCode === 410) {
              // Subscription has expired or is no longer valid
              return this.prisma.pushSubscription.delete({
                where: { endpoint: sub.endpoint },
              });
            } else {
              logger.error(err);
            }
          });
      });

      await Promise.all(notificationsPromise);
    } catch (error) {
      if (error instanceof Error) console.error(error.message);

      throw new InternalServerErrorException('Failed to send notification to user');
    }
  }

  /**
   * Send notification to user's connections
   *
   * @param userId
   * @param payload
   */
  async sendNotificationToUserConnections<T>(userId: bigint, payload: T) {
    try {
      const userConnections = await this.prisma.connection.findMany({
        where: {
          fromId: userId, // use currentUserId as pointer, as toId will be the other user
        },
      });

      const notificationPromises = userConnections.map(async (con) => {
        return this.sendNotificationToUser(con.toId, payload);
      });

      await Promise.all(notificationPromises);
    } catch (error) {
      if (error instanceof Error) console.error(error.message);

      throw new InternalServerErrorException('Failed to send notifications to user connections');
    }
  }
}
