import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
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

  /**
   * Database seeder
   * @returns void
   */
  public async seed(): Promise<void> {
    /**
     * Users
     * create 100 users
     * (X, userX, userX@mail.com, Password1!, User First Last X, ex-Software Engineer @ (Random Companies), 2020-2025),React, django, ''>
     * *
     */
    logger.info('Creating users');
    const totalUsers = 400;
    const users: Prisma.UserCreateManyInput[] = [];
    const hashedPassword = await bcrypt.hash('Password1!', 10);

    for (let id = 1n; id <= totalUsers; id++) {
      const companies = [];
      for (let j = 0; j < faker.number.int({ min: 0, max: 5 }); j++) {
        companies.push(faker.company.name());
      }
      const finalCompanies = companies.length > 0 ? companies.join(', ') : null;

      const skills = [];
      for (let j = 0; j < faker.number.int({ min: 0, max: 5 }); j++) {
        skills.push(faker.person.jobTitle());
      }
      const finalSkills = skills.length > 0 ? skills.join(', ') : null;

      users.push({
        id: id,
        username: `user${id}`,
        email: `user${id}@mail.com`,
        passwordHash: hashedPassword,
        fullName: faker.person.fullName(),
        workHistory: finalCompanies ? `ex-Software Engineer @ (${finalCompanies})` : null,
        skills: finalSkills,
        profilePhotoPath: '',
      });
    }

    /**
     * Feeds
     * every user have 50 feeds
     *
     */
    logger.info('Creating feeds');
    const totalFeedsPerUser = 50;
    const feeds: Prisma.FeedCreateManyInput[] = [];
    for (let userId = 1n; userId <= totalUsers; userId++) {
      for (let j = 0; j < totalFeedsPerUser; j++) {
        feeds.push({
          content: faker.lorem.sentence(),
          userId,
          createdAt: faker.date.recent(),
        });
      }
    }

    /**
     * Connections & Connection requests
     * Note that connections are mutual, so we need to create 2 rows
     */
    logger.info('Creating connections and connection requests');

    const connections: Prisma.ConnectionCreateManyInput[] = [];
    const connectionRequests: Prisma.ConnectionRequestCreateManyInput[] = [];

    for (let i = 0; i < totalUsers; i++) {
      // Connection
      const endJ = Math.floor((totalUsers * 3) / 4);
      for (let j = i + 1; j < endJ; j++) {
        const date = faker.date.recent();
        const id1 = i + 1;
        const id2 = j + 1;

        connections.push(
          { fromId: id1, toId: id2, createdAt: date },
          { fromId: id2, toId: id1, createdAt: date }
        );
      }

      // The rest is for connection request
      for (let j = 0; j < Math.floor(i / 2); j++) {
        const date = faker.date.recent();
        const id1 = i + 1;
        const id2 = j + 1;

        connectionRequests.push({
          fromId: id1,
          toId: id2,
          createdAt: date,
        });
      }
      for (let j = endJ; j < totalUsers; j++) {
        const date = faker.date.recent();

        const id1 = i + 1;
        const id2 = j + 1;

        connectionRequests.push({
          fromId: id1,
          toId: id2,
          createdAt: date,
        });
      }
    }

    /**
     * Chats
     * for every connected user, generate 50 messages
     */
    logger.info('Creating chats');
    const totalChatsPerConnectedUser = 50;
    const chats: Prisma.ChatCreateManyInput[] = [];
    // for (const connection of connections) {
    //   for (let j = 0; j < totalChatsPerConnectedUser; j++) {
    //     chats.push({
    //       fromId: connection.fromId,
    //       toId: connection.toId,
    //       message: faker.lorem.sentence(),
    //       timestamp: faker.date.recent(),
    //     });
    //   }
    // }

    logger.info('Seeding database');
    await this.prisma.$transaction(
      async (tx) => {
        // Delete all
        await tx.chat.deleteMany({});
        await tx.connection.deleteMany({});
        await tx.connectionRequest.deleteMany({});
        await tx.feed.deleteMany({});
        await tx.user.deleteMany({});

        // Create meny
        await tx.user.createMany({ data: users });
        await tx.feed.createMany({ data: feeds });
        await tx.connection.createMany({ data: connections });
        await tx.connectionRequest.createMany({ data: connectionRequests });
        await tx.chat.createMany({ data: chats });

        // Update users_id_seq
        await tx.$executeRaw`
          SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
      `;

        // Update feeds_id_seq
        await tx.$executeRaw`
          SELECT setval(pg_get_serial_sequence('feed', 'id'), (SELECT MAX(id) FROM feed));
      `;
      },
      {
        timeout: 120 * 1000,
      }
    );
    logger.info('Seeding database done');
  }
}
