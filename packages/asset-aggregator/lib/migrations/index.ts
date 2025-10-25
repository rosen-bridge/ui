import { Migration1759776111031 } from './postgres';
import { Migration1761203759400 } from './sqlite';

export const migrations = {
  postgres: [Migration1759776111031],
  sqlite: [Migration1761203759400],
};
