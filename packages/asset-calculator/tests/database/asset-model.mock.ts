import { DataSource, Repository } from 'typeorm';

import { AssetEntity } from '../../lib/database/asset-entity';
import migrations from '../../lib/database/migrations';

let dataSource: DataSource;
let assetRepository: Repository<AssetEntity>;

const initDatabase = async (): Promise<DataSource> => {
  dataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [AssetEntity],
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
  assetRepository = dataSource.getRepository(AssetEntity);
  return dataSource;
};

const allAssetRecords = () => {
  return assetRepository.find();
};

const insertAssetRecords = (assets: AssetEntity[]) => {
  return assetRepository.insert(assets);
};

export { initDatabase, allAssetRecords, insertAssetRecords };
