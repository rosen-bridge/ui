import { Migration1741702976404 } from './postgres/1741702976404-migration';
import { Migration1782678959094 } from './postgres/1782678959094-migration';
import { Migration1786789762088 } from './postgres/1786789762088-migration';
import { Migration1745413346225 } from './sqlite/1745413346225-migration';
import { Migration1782679956690 } from './sqlite/1782679956690-migration';
import { Migration1786789762089 } from './sqlite/1786789762089-migration';

export default {
  postgres: [Migration1741702976404, Migration1782678959094, Migration1786789762088],
  sqlite: [Migration1745413346225, Migration1782679956690, Migration1786789762089],
};
