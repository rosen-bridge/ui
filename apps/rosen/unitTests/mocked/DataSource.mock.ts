import { testDataSource } from '@rosen-ui/data-source';
import {
  GuardStatusEntity,
  AggregatedStatusChangedEntity,
  AggregatedStatusEntity,
  GuardStatusChangedEntity,
  TxEntity,
} from '@rosen-ui/public-status';

export class DataSourceMock {
  /**
   * initializes test data source
   */
  static init = async () => {
    await testDataSource.initialize();
    await testDataSource.runMigrations();
  };

  /**
   * deletes every record from every table
   */
  static clearTables = async () => {
    await testDataSource.dropDatabase();
    await testDataSource.destroy();
    await testDataSource.initialize();
    await testDataSource.runMigrations();
  };

  /**
   * populate AggregatedStatusChangedEntity table with mock records
   * @param records
   */
  static populateAggregatedStatusChanged = async (
    records: AggregatedStatusChangedEntity[],
  ) => {
    for (const record of records) {
      await testDataSource
        .getRepository(AggregatedStatusChangedEntity)
        .insert(record);
    }
  };

  /**
   * gets all AggregatedStatusChangedEntity records
   */
  static listAggregatedStatusChanged = async (): Promise<
    AggregatedStatusChangedEntity[]
  > => {
    return await testDataSource
      .getRepository(AggregatedStatusChangedEntity)
      .find();
  };

  /**
   * populate AggregatedStatusEntity table with mock records
   * @param records
   */
  static populateAggregatedStatus = async (
    records: AggregatedStatusEntity[],
  ) => {
    for (const record of records) {
      await testDataSource.getRepository(AggregatedStatusEntity).insert(record);
    }
  };

  /**
   * gets all AggregatedStatusEntity records
   */
  static listAggregatedStatus = async (): Promise<AggregatedStatusEntity[]> => {
    return await testDataSource.getRepository(AggregatedStatusEntity).find();
  };

  /**
   * populate GuardStatusChangedEntity table with mock records
   * @param records
   */
  static populateGuardStatusChanged = async (
    records: GuardStatusChangedEntity[],
  ) => {
    for (const record of records) {
      await testDataSource
        .getRepository(GuardStatusChangedEntity)
        .insert(record);
    }
  };

  /**
   * gets all GuardStatusChangedEntity records
   */
  static listGuardStatusChanged = async (): Promise<
    GuardStatusChangedEntity[]
  > => {
    return await testDataSource.getRepository(GuardStatusChangedEntity).find();
  };

  /**
   * populate GuardStatusEntity table with mock records
   * @param records
   */
  static populateGuardStatus = async (records: GuardStatusEntity[]) => {
    for (const record of records) {
      await testDataSource.getRepository(GuardStatusEntity).insert(record);
    }
  };

  /**
   * gets all GuardStatusEntity records
   */
  static listGuardStatus = async (): Promise<GuardStatusEntity[]> => {
    return await testDataSource.getRepository(GuardStatusEntity).find();
  };

  /**
   * gets all TxEntity records
   */
  static listTx = async (): Promise<TxEntity[]> => {
    return await testDataSource.getRepository(TxEntity).find();
  };
}
