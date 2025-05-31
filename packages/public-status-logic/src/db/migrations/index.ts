import { Migration1741702976404 } from './postgres/1741702976404-migration';
import { Migration1745413346225 } from './sqlite/1745413346225-migration';

export default {
  postgres: [Migration1741702976404],
  sqlite: [Migration1745413346225],
};
