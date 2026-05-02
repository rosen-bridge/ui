import { Migration1766672044812 } from './postgres/1766672044812-migration';
import { Migration1767795454053 } from './postgres/1767795454053-migration';
import { Migration1768483838915 } from './postgres/1768483838915-migration';
import { Migration1770567980819 } from './postgres/1770567980819-migration';
import { Migration1770593616973 } from './postgres/1770593616973-migration';
import { Migration1775987532007 } from './postgres/1775987532007-migration';
import { Migration1766671792925 } from './sqlite/1766671792925-migration';
import { Migration1767795498078 } from './sqlite/1767795498078-migration';
import { Migration1768483786296 } from './sqlite/1768483786296-migration';
import { Migration1770568082481 } from './sqlite/1770568082481-migration';
import { Migration1770593651771 } from './sqlite/1770593651771-migration';
import { Migration1775986364817 } from './sqlite/1775986364817-migration';

export const migrations = {
  sqlite: [
    Migration1766671792925,
    Migration1767795498078,
    Migration1768483786296,
    Migration1770568082481,
    Migration1770593651771,
    Migration1775986364817,
  ],
  postgres: [
    Migration1766672044812,
    Migration1767795454053,
    Migration1768483838915,
    Migration1770567980819,
    Migration1770593616973,
    Migration1775987532007,
  ],
};
