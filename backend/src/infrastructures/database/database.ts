import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addHours, subHours } from 'date-fns';
import { injectable } from 'inversify';

import { logger } from '@/core/logger';

@injectable()
export class Database {
  // IoC key
  static readonly Key = Symbol.for('Database');

  // Prisma
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get Prisma client
   * @returns PrismaClient
   */
  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  /**
   * Connect to database
   * @returns void
   */
  public async connect(): Promise<void> {
    logger.info('Connecting to database');
    await this.prisma.$connect();
    logger.info('Connected to database');
  }

  /**
   * Disconnect from database
   * @returns void
   */
  public async disconnect(): Promise<void> {
    logger.info('Disconnecting from database');
    await this.prisma.$disconnect();
    logger.info('Disconnected from database');
  }

  private async batchProcess<T>(
    items: T[],
    batchSize: number,
    processFunction: (batch: T[]) => Promise<void>
  ) {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await processFunction(batch);
    }
  }

  public async seed({
    BATCH_SIZE = 100,
    USER_COUNT = 400,
    MAX_FEED_COUNT = 26,
    MAX_CONNECTION_COUNT = 201,
    MAX_REQUEST_COUNT = 31,
    MAX_CHAT_MESSAGES = 51,
  }): Promise<void> {
    try {
      // Delete all existing data first
      logger.info('Deleting existing data...');
      await this.prisma.$transaction([
        this.prisma.chat.deleteMany(),
        this.prisma.connection.deleteMany(),
        this.prisma.connectionRequest.deleteMany(),
        this.prisma.feed.deleteMany(),
        this.prisma.user.deleteMany(),
      ]);

      // Create users in batches
      logger.info('Creating users...');
      const hashedPassword = await bcrypt.hash('Password1!', 10);

      for (let batch = 0; batch < USER_COUNT; batch += BATCH_SIZE) {
        const endIndex = Math.min(batch + BATCH_SIZE, USER_COUNT);
        const userBatch = Array.from({ length: endIndex - batch }, (_, i) => ({
          id: BigInt(batch + i + 1),
          username: `user${batch + i + 1}`,
          email: `user${batch + i + 1}@example.com`,
          passwordHash: hashedPassword,
          fullName: faker.person.fullName(),
          workHistory: faker.lorem.paragraphs(),
          skills: faker.lorem.words(5),
          profilePhotoPath: faker.image.avatar(),
          createdAt: faker.date.past(),
        }));

        await this.prisma.user.createMany({ data: userBatch });
        logger.info(`Created users ${batch + 1} to ${endIndex}`);
      }

      // Create feeds in batches
      logger.info('Creating feeds...');
      for (let userBatch = 1; userBatch <= USER_COUNT; userBatch += BATCH_SIZE) {
        const feedBatch = [];
        for (
          let userId = userBatch;
          userId < userBatch + BATCH_SIZE && userId <= USER_COUNT;
          userId++
        ) {
          const feedCount = Math.floor(Math.random() * MAX_FEED_COUNT);
          for (let i = 0; i < feedCount; i++) {
            feedBatch.push({
              userId: BigInt(userId),
              content: faker.lorem.paragraph(),
              createdAt: faker.date.past(),
            });
          }
        }
        await this.prisma.feed.createMany({ data: feedBatch });
        logger.info(
          `Created feeds for users ${userBatch} to ${Math.min(userBatch + BATCH_SIZE - 1, USER_COUNT)}`
        );
      }

      // Create connections in batches
      logger.info('Creating connections...');
      const connectionSet = new Set<string>();

      for (let userBatch = 1; userBatch <= USER_COUNT; userBatch += BATCH_SIZE) {
        const connectionBatch: Prisma.ConnectionCreateManyInput[] = [];

        for (
          let userId = userBatch;
          userId < userBatch + BATCH_SIZE && userId <= USER_COUNT;
          userId++
        ) {
          const connectionCount = Math.floor(Math.random() * MAX_CONNECTION_COUNT);
          let currentConnections = 0;

          while (currentConnections < connectionCount) {
            const potentialConnection = BigInt(Math.floor(Math.random() * USER_COUNT) + 1);
            const connectionKey = `${userId}-${potentialConnection}`;
            const reverseKey = `${potentialConnection}-${userId}`;

            if (
              potentialConnection !== BigInt(userId) &&
              !connectionSet.has(connectionKey) &&
              !connectionSet.has(reverseKey)
            ) {
              connectionSet.add(connectionKey);
              connectionBatch.push(
                {
                  fromId: BigInt(userId),
                  toId: potentialConnection,
                  createdAt: faker.date.past(),
                },
                {
                  fromId: potentialConnection,
                  toId: BigInt(userId),
                  createdAt: faker.date.past(),
                }
              );
              currentConnections++;
            }
          }
        }

        if (connectionBatch.length > 0) {
          await this.batchProcess(connectionBatch, 1000, async (batch) => {
            await this.prisma.connection.createMany({ data: batch });
          });
        }
        logger.info(
          `Created connections for users ${userBatch} to ${Math.min(userBatch + BATCH_SIZE - 1, USER_COUNT)}`
        );
      }

      // Create connection requests in batches
      logger.info('Creating connection requests...');
      const requestSet = new Set<string>();

      for (let userBatch = 1; userBatch <= USER_COUNT; userBatch += BATCH_SIZE) {
        const requestBatch: Prisma.ConnectionRequestCreateManyInput[] = [];

        for (
          let userId = userBatch;
          userId < userBatch + BATCH_SIZE && userId <= USER_COUNT;
          userId++
        ) {
          const requestCount = Math.floor(Math.random() * MAX_REQUEST_COUNT);
          let currentRequests = 0;

          while (currentRequests < requestCount) {
            const potentialRequest = BigInt(Math.floor(Math.random() * USER_COUNT) + 1);
            const requestKey = `${userId}-${potentialRequest}`;
            const reverseKey = `${potentialRequest}-${userId}`;

            if (
              potentialRequest !== BigInt(userId) &&
              !connectionSet.has(requestKey) &&
              !connectionSet.has(reverseKey) &&
              !requestSet.has(requestKey) &&
              !requestSet.has(reverseKey)
            ) {
              requestSet.add(requestKey);
              requestBatch.push({
                fromId: BigInt(userId),
                toId: potentialRequest,
                createdAt: faker.date.past(),
              });
              currentRequests++;
            }
          }
        }

        if (requestBatch.length > 0) {
          await this.batchProcess(requestBatch, 1000, async (batch) => {
            await this.prisma.connectionRequest.createMany({ data: batch });
          });
        }
        logger.info(
          `Created connection requests for users ${userBatch} to ${Math.min(userBatch + BATCH_SIZE - 1, USER_COUNT)}`
        );
      }

      // Create chats in batches
      logger.info('Creating chats...');
      let processedConnections = 0;

      const baseDate = subHours(new Date(), connectionSet.size);

      for (const connectionKey of connectionSet) {
        const chatBatch: Prisma.ChatCreateManyInput[] = [];
        const [fromId, toId] = connectionKey.split('-').map((id) => BigInt(id));
        const messageCount = 50 + Math.floor(Math.random() * MAX_CHAT_MESSAGES);

        for (let i = 0; i < messageCount; i++) {
          const isFromFirst = Math.random() > 0.5;

          // minus days using date-fns
          const newDate = addHours(baseDate, processedConnections);

          chatBatch.push({
            fromId: isFromFirst ? fromId : toId,
            toId: isFromFirst ? toId : fromId,
            message: faker.lorem.sentence(),
            timestamp: newDate,
          });
        }

        await this.batchProcess(chatBatch, 1000, async (batch) => {
          await this.prisma.chat.createMany({ data: batch });
        });

        processedConnections++;
        if (processedConnections % 100 === 0) {
          logger.info(`Created chats for ${processedConnections} connections`);
        }

        // make seeder fast
        if (processedConnections === 1000) {
          break;
        }
      }

      // Update sequences
      logger.info('Updating sequences...');
      await this.prisma.$executeRaw`
        SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
      `;
      await this.prisma.$executeRaw`
        SELECT setval(pg_get_serial_sequence('feed', 'id'), (SELECT MAX(id) FROM feed));
      `;

      logger.info('Seeding database completed successfully');
    } catch (error) {
      if (error instanceof Error)
        logger.error('Error seeding database:', error.stack ?? '', error.message);
      throw error;
    }
  }
}
