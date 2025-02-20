import { DataSource } from 'typeorm';

import { EventStatus, TxType, TxStatus } from '../../../src/constants';
import { GuardStatusChangedEntity } from '../../../src/db/entities/GuardStatusChangedEntity';
import { StatusChangedEntity } from '../../../src/db/entities/StatusChangedEntity';
import { EventStatusActor } from '../../../src/db/EventStatusActor';
import migrations from '../../../src/db/migrations';
import {
  eventStatusToAggregate,
  txStatusToAggregate,
} from '../../../src/utils';
import testConfig from '../../testConfig';

class EventStatusActorMock {
  static testDataSource = new DataSource({
    type: 'postgres',
    entities: [StatusChangedEntity, GuardStatusChangedEntity],
    migrations: [...migrations.postgres],
    synchronize: false,
    logging: false,
    host: testConfig.host,
    port: testConfig.port,
    username: testConfig.user,
    password: testConfig.password,
    database: testConfig.database,
  });
  static testDatabase: EventStatusActor;

  static initDatabase = async () => {
    try {
      await this.testDataSource.initialize();
      await this.testDataSource.runMigrations();
      console.info('Test Data Source has been initialized!');
    } catch (err) {
      console.error(`An error occurred while initializing test datasource`);
      console.error(err.stack);
    }
    EventStatusActor.init(this.testDataSource);
    this.testDatabase = EventStatusActor.getInstance();
  };

  static clearTables = async () => {
    const entities = this.testDatabase.dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = this.testDatabase.dataSource.getRepository(
        entity.name,
      );

      await repository.query(
        `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
      );
    }
  };

  static insertFakeStatusChangedRecords = async (
    records: {
      timestamp: number;
      eventId: string;
      status: EventStatus;
      txId?: string;
      txType?: TxType;
      txStatus?: TxStatus;
    }[],
  ) => {
    for (const record of records) {
      await this.testDatabase.statusChangedRepository.insert({
        insertedAt: record.timestamp + 2,
        eventId: record.eventId,
        status: eventStatusToAggregate(record.status),
        txId: record.txId,
        txType: record.txType,
        txStatus: record.txStatus && txStatusToAggregate(record.txStatus),
      });
    }
  };

  static insertFakeGuardStatusChangedRecords = async (
    records: {
      timestamp: number;
      guardPk: string;
      eventId: string;
      status: EventStatus;
      txId?: string;
      txType?: TxType;
      txStatus?: TxStatus;
    }[],
  ) => {
    for (const record of records) {
      await this.testDatabase.guardStatusChangedRepository.insert({
        insertedAt: record.timestamp + 2,
        eventId: record.eventId,
        guardPk: record.guardPk,
        status: record.status,
        txId: record.txId,
        txType: record.txType,
        txStatus: record.txStatus,
      });
    }
  };
}

export default EventStatusActorMock;
