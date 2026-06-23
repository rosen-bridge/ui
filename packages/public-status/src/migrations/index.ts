import { Migration1741702976404 } from './postgres/1741702976404-migration';
import { Migration1781608382828 } from './postgres/1781608382828-migration';
import { Migration1745413346225 } from './sqlite/1745413346225-migration';
import { Migration1781607921906 } from './sqlite/1781607921906-migration';

export default {
  postgres: [Migration1741702976404, Migration1781608382828],
  sqlite: [Migration1745413346225, Migration1781607921906],
};
