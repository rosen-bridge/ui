import { DataSource, Repository } from 'typeorm';

import { TokenEntity, LockedAssetEntity } from '../../../lib';
import { BridgedAssetEntity } from '../../../lib/database/bridgedAsset/BridgedAssetEntity';
import migrations from '../../../lib/database/migrations';
import { tokens } from '../test-data';

let dataSource: DataSource;
let assetRepository: Repository<BridgedAssetEntity>;
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
  assetRepository = dataSource.getRepository(BridgedAssetEntity);
  tokenRepository = dataSource.getRepository(TokenEntity);
  return dataSource;
};

const allAssetRecords = () => {
  return assetRepository.find({ relations: ['token'] });
};

const insertAssetRecords = async (assets: BridgedAssetEntity[]) => {
  await tokenRepository.insert(tokens);
  return assetRepository.insert(assets);
};

export { initDatabase, allAssetRecords, insertAssetRecords };
