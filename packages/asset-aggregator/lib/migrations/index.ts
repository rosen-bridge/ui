import { Migration1761566611685 } from './postgres';
import { Migration1761566399698 } from './sqlite';

export const migrations = {
  postgres: [Migration1761566611685],
  sqlite: [Migration1761566399698],
};
