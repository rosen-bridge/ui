import { AggregatedStatusChangedEntity } from '../../../src/db/entities/AggregatedStatusChangedEntity';
import { AggregatedStatusEntity } from '../../../src/db/entities/AggregatedStatusEntity';
import { GuardStatusChangedEntity } from '../../../src/db/entities/GuardStatusChangedEntity';
import { GuardStatusEntity } from '../../../src/db/entities/GuardStatusEntity';
import {
  AggregatedStatusChangedRepository,
  createAggregatedStatusChangedRepository,
} from '../../../src/db/repositories/AggregatedStatusChangedRepository';
import {
  AggregatedStatusRepository,
  createAggregatedStatusRepository,
} from '../../../src/db/repositories/AggregatedStatusRepository';
import {
  GuardStatusChangedRepository,
  createGuardStatusChangedRepository,
} from '../../../src/db/repositories/GuardStatusChangedRepository';
import {
  GuardStatusRepository,
  createGuardStatusRepository,
} from '../../../src/db/repositories/GuardStatusRepository';
import {
  TxRepository,
  createTxRepository,
} from '../../../src/db/repositories/TxRepository';
import { testDataSource } from './testDataSource';

export class DataSourceMock {
  static testDataSource = testDataSource;

  static aggregatedStatusChangedRepository: AggregatedStatusChangedRepository;
  static aggregatedStatusRepository: AggregatedStatusRepository;
  static guardStatusChangedRepository: GuardStatusChangedRepository;
  static guardStatusRepository: GuardStatusRepository;
  static txRepository: TxRepository;

  /**
   * initializes test data source
   */
  static init = async () => {
    await this.testDataSource.initialize();
    await this.testDataSource.runMigrations();

    this.aggregatedStatusChangedRepository =
      createAggregatedStatusChangedRepository(this.testDataSource);
    this.aggregatedStatusRepository = createAggregatedStatusRepository(
      this.testDataSource,
    );
    this.guardStatusChangedRepository = createGuardStatusChangedRepository(
      this.testDataSource,
    );
    this.guardStatusRepository = createGuardStatusRepository(
      this.testDataSource,
    );
    this.txRepository = createTxRepository(this.testDataSource);
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
   * populate AggregatedStatusChangedEntity table with mock records
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
   * populate AggregatedStatusEntity table with mock records
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
   * populate GuardStatusChangedEntity table with mock records
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
   * populate GuardStatusEntity table with mock records
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
