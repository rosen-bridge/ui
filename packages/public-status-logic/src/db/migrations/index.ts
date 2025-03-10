import { Migration1741521587183 } from './postgres/1741521587183-migration';
import { Migration1741521346209 } from './sqlite/1741521346209-migration';

export default {
  postgres: [Migration1741521587183],
  sqlite: [Migration1741521346209],
};
