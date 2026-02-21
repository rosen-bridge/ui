import { Migration1766672044812 } from './postgres/1766672044812-migration';
import { Migration1767795454053 } from './postgres/1767795454053-migration';
import { Migration1768483838915 } from './postgres/1768483838915-migration';
import { Migration1766671792925 } from './sqlite/1766671792925-migration';
import { Migration1767795498078 } from './sqlite/1767795498078-migration';
import { Migration1768483786296 } from './sqlite/1768483786296-migration';

export const migrations = {
  sqlite: [
    Migration1766671792925,
    Migration1767795498078,
    Migration1768483786296,
  ],
  postgres: [
    Migration1766672044812,
    Migration1767795454053,
    Migration1768483838915,
  ],
};
