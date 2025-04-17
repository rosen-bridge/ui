import { DataSource } from '@rosen-bridge/extended-typeorm';

import { AggregatedStatusChangedEntity } from './entities/AggregatedStatusChangedEntity';
import { AggregatedStatusEntity } from './entities/AggregatedStatusEntity';
import { GuardStatusChangedEntity } from './entities/GuardStatusChangedEntity';
import { GuardStatusEntity } from './entities/GuardStatusEntity';
import { TxEntity } from './entities/TxEntity';
import migrations from './migrations';
import {
  AggregatedStatusChangedRepository,
  createAggregatedStatusChangedRepository,
} from './repositories/AggregatedStatusChangedRepository';
import {
  AggregatedStatusRepository,
  createAggregatedStatusRepository,
} from './repositories/AggregatedStatusRepository';
import {
  GuardStatusChangedRepository,
  createGuardStatusChangedRepository,
} from './repositories/GuardStatusChangedRepository';
import {
  GuardStatusRepository,
  createGuardStatusRepository,
} from './repositories/GuardStatusRepository';
import { TxRepository, createTxRepository } from './repositories/TxRepository';

export class DataSourceHandler {
  private static instance?: DataSourceHandler;
  readonly dataSource: DataSource;

  aggregatedStatusChangedRepository: AggregatedStatusChangedRepository;
  aggregatedStatusRepository: AggregatedStatusRepository;
  guardStatusChangedRepository: GuardStatusChangedRepository;
  guardStatusRepository: GuardStatusRepository;
  txRepository: TxRepository;

  protected constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.aggregatedStatusChangedRepository =
      createAggregatedStatusChangedRepository(this.dataSource);
    this.aggregatedStatusRepository = createAggregatedStatusRepository(
      this.dataSource,
    );
    this.guardStatusChangedRepository = createGuardStatusChangedRepository(
      this.dataSource,
    );
    this.guardStatusRepository = createGuardStatusRepository(this.dataSource);
    this.txRepository = createTxRepository(this.dataSource);
  }

  /**
   * initialize DataSourceHandler
   */
  static init = async (postgresUrl: string, postgresUseSSL: boolean) => {
    if (DataSourceHandler.instance)
      throw Error(`DataSourceHandler is already initialized`);

    const dataSource = new DataSource({
      type: 'postgres',
      url: postgresUrl,
      ssl: postgresUseSSL,
      entities: [
        AggregatedStatusEntity,
        AggregatedStatusChangedEntity,
        GuardStatusEntity,
        GuardStatusChangedEntity,
        TxEntity,
      ],
      migrations: [...migrations.postgres],
      synchronize: false,
      logging: false,
    });

    await dataSource.initialize();
    await dataSource.runMigrations();

    DataSourceHandler.instance = new DataSourceHandler(dataSource);
  };

  /**
   * get DataSourceHandler instance or throw
   * @returns DataSourceHandler instance
   */
  static getInstance = () => {
    if (!DataSourceHandler.instance)
      throw Error(
        `DataSourceHandler should have been initialized before getInstance`,
      );
    return DataSourceHandler.instance;
  };
}
