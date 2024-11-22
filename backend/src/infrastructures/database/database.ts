import { PrismaClient } from '@prisma/client';
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
}
