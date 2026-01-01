import { Migration1766672044812 } from './postgres/1766672044812-migration';
import { Migration1766671792925 } from './sqlite/1766671792925-migration';

export const migrations = {
  sqlite: [Migration1766671792925],
  postgres: [Migration1766672044812],
};
