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
    await this.database.seed();
  }
}

const seeder = new Seeder();
seeder.run();
