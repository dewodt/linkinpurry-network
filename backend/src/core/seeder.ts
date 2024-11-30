import type { Container } from 'inversify';
import 'reflect-metadata';

import { Database } from '@/infrastructures/database/database';

import { DependencyContainer } from './container';

/**
 * Entrypoint for seeder
 */
export class Seeder {
  private container: Container;

  private database: Database;

  constructor() {
    this.container = new DependencyContainer().getContainer();
    this.database = this.container.get<Database>(Database.Key);
  }

  public async run(): Promise<void> {
    // Modify as needed
    await this.database.seed({
      BATCH_SIZE: 100,
      USER_COUNT: 400,
      MAX_FEED_COUNT: 26,
      MAX_CONNECTION_COUNT: 201,
      MAX_REQUEST_COUNT: 31,
      MAX_CHAT_MESSAGES: 51,
    });
  }
}

const seeder = new Seeder();
seeder.run();
