import { Migration1707118384971 } from './postgres/1707118384971-migration';
import { Migration1707721120491 } from './sqlite/1707721120491-migration';

export default {
  sqlite: [Migration1707721120491],
  postgres: [Migration1707118384971],
};
