import { DataSource } from 'typeorm';

import { GuardStatusChangedEntity } from '../../../src/db/entities/GuardStatusChangedEntity';
import { OverallStatusChangedEntity } from '../../../src/db/entities/OverallStatusChangedEntity';
import { TxEntity } from '../../../src/db/entities/TxEntity';
import { EventStatusActor } from '../../../src/db/EventStatusActor';
import migrations from '../../../src/db/migrations';
import testConfig from '../../testConfig';

class EventStatusActorMock {
  static testDataSource = new DataSource({
    type: 'postgres',
    entities: [OverallStatusChangedEntity, GuardStatusChangedEntity, TxEntity],
    migrations: [...migrations.postgres],
    synchronize: false,
    logging: false,
    host: testConfig.host,
    port: testConfig.port,
    username: testConfig.user,
    password: testConfig.password,
    database: testConfig.database,
  });
  static actor: EventStatusActor;

  /**
   * initializes test datasource and actor
   */
  static init = async () => {
    try {
      await this.testDataSource.initialize();
      await this.testDataSource.runMigrations();
      console.info('Test Data Source has been initialized!');
    } catch (err) {
      console.error(`An error occurred while initializing test datasource`);
      console.error(err.stack);
    }
    EventStatusActor.init(this.testDataSource);
    this.actor = EventStatusActor.getInstance();
  };

  /**
   * deletes every record from every table
   */
  static clearTables = async () => {
    const entities = this.actor.dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = this.actor.dataSource.getRepository(entity.name);

      await repository.query(
        `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
      );
    }
  };

  /**
   * inserts array of OverallStatusChangedEntity in database
   * @param records
   */
  static populateOverallStatusChanged = async (
    records: Omit<OverallStatusChangedEntity, 'id'>[],
  ) => {
    for (const record of records) {
      await this.actor.overallStatusChangedRepository.insert(record);
    }
  };

  /**
   * inserts array of OverallStatusChangedEntity in database
   * @param records
   */
  static populateGuardStatusChanged = async (
    records: Omit<GuardStatusChangedEntity, 'id'>[],
  ) => {
    for (const record of records) {
      await this.actor.guardStatusChangedRepository.insert(record);
    }
  };
}

export default EventStatusActorMock;
