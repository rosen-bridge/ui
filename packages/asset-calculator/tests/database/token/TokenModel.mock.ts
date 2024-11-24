import { DataSource, Repository } from 'typeorm';

import { TokenEntity, LockedAssetEntity } from '../../../lib';
import { BridgedAssetEntity } from '../../../lib/database/bridgedAsset/BridgedAssetEntity';
import migrations from '../../../lib/database/migrations';

let dataSource: DataSource;
let tokenRepository: Repository<TokenEntity>;

const initDatabase = async (): Promise<DataSource> => {
  dataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [BridgedAssetEntity, TokenEntity, LockedAssetEntity],
    migrations: migrations['sqlite'],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    await dataSource.runMigrations();
    console.info('Test Data Source has been initialized!');
  } catch (err) {
    console.error(`An error occurred while initializing test datasource`);
    console.error(err);
  }
  tokenRepository = dataSource.getRepository(TokenEntity);
  return dataSource;
};

const allTokenRecords = () => {
  return tokenRepository.find();
};

const insertTokenRecords = (assets: TokenEntity[]) => {
  return tokenRepository.insert(assets);
};

export { initDatabase, allTokenRecords, insertTokenRecords };
