import { DataSource } from '@rosen-bridge/extended-typeorm';
import path from 'path';
import { fileURLToPath } from 'url';

import entities from './db/entities';
import migrations from './db/migrations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dataSource = new DataSource({
  type: 'sqlite',
  database: __dirname + '/sqlite/db.sqlite',
  entities,
  migrations,
  synchronize: false,
  logging: false,
});
