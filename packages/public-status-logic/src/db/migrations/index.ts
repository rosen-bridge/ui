import { Migration1741702976404 } from './postgres/1741702976404-migration';
import { Migration1741702796894 } from './sqlite/1741702796894-migration';

export default {
  postgres: [Migration1741702976404],
  sqlite: [Migration1741702796894],
};
