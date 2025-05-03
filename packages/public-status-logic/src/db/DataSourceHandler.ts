import { DataSource } from '@rosen-bridge/extended-typeorm';

import { AggregatedStatusChangedEntity } from './entities/AggregatedStatusChangedEntity';
import { AggregatedStatusEntity } from './entities/AggregatedStatusEntity';
import { GuardStatusChangedEntity } from './entities/GuardStatusChangedEntity';
import { GuardStatusEntity } from './entities/GuardStatusEntity';
import { TxEntity } from './entities/TxEntity';
import migrations from './migrations';

export class DataSourceHandler {
  private static instance?: DataSourceHandler;
  readonly dataSource: DataSource;

  protected constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
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
