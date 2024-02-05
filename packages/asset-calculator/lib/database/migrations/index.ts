import { Migration1707118384971 } from './postgres/1707118384971-migration';
import { Migration1707118314034 } from './sqlite/1707118314034-migration';

export default {
  sqlite: [Migration1707118314034],
  postgres: [Migration1707118384971],
};
