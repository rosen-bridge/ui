import startApp from './app';
import './bootstrap';
import { dataSource } from './data-source';

const main = async () => {
  await dataSource.initialize();
  await dataSource.runMigrations();
  startApp();
};

main();
