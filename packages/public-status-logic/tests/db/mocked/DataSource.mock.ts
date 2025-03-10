import { AggregatedStatusChangedEntity } from '../../../src/db/entities/AggregatedStatusChangedEntity';
import { AggregatedStatusEntity } from '../../../src/db/entities/AggregatedStatusEntity';
import { GuardStatusChangedEntity } from '../../../src/db/entities/GuardStatusChangedEntity';
import { GuardStatusEntity } from '../../../src/db/entities/GuardStatusEntity';
import { testDataSource } from './testDataSource';

export class DataSourceMock {
  static testDataSource = testDataSource;

  /**
   * initializes test data source
   */
  static init = async () => {
    await this.testDataSource.initialize();
    await this.testDataSource.runMigrations();
  };

  /**
   * deletes every record from every table
   */
  static clearTables = async () => {
    await this.testDataSource.dropDatabase();
    await this.testDataSource.destroy();
    await this.testDataSource.initialize();
    await this.testDataSource.runMigrations();
  };

  /**
   * populate AggregatedStatusChangedEntity table with fake records
   * @param records
   */
  static populateAggregatedStatusChanged = async (
    records: Omit<AggregatedStatusChangedEntity, 'id'>[],
  ) => {
    for (const record of records) {
      await this.testDataSource
        .getRepository(AggregatedStatusChangedEntity)
        .insert({ ...record });
    }
  };

  /**
   * populate AggregatedStatusEntity table with fake records
   * @param records
   */
  static populateAggregatedStatus = async (
    records: Omit<AggregatedStatusEntity, 'id'>[],
  ) => {
    for (const record of records) {
      await this.testDataSource
        .getRepository(AggregatedStatusEntity)
        .insert({ ...record });
    }
  };

  /**
   * populate GuardStatusChangedEntity table with fake records
   * @param records
   */
  static populateGuardStatusChanged = async (
    records: Omit<GuardStatusChangedEntity, 'id'>[],
  ) => {
    for (const record of records) {
      await this.testDataSource
        .getRepository(GuardStatusChangedEntity)
        .insert({ ...record });
    }
  };

  /**
   * populate GuardStatusEntity table with fake records
   * @param records
   */
  static populateGuardStatus = async (
    records: Omit<GuardStatusEntity, 'id'>[],
  ) => {
    for (const record of records) {
      await this.testDataSource
        .getRepository(GuardStatusEntity)
        .insert({ ...record });
    }
  };
}
