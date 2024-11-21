import { PrismaClient } from '@prisma/client';
import { injectable } from 'inversify';

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
    await this.prisma.$connect();
  }

  /**
   * Disconnect from database
   * @returns void
   */
  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
