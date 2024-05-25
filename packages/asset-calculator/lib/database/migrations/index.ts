import { Migration1712136836448 } from './postgres/1712136836448-migration';
import { Migration1715254604937 } from './postgres/1715254604937-migration';
import { Migration1716290617188 } from './postgres/1716290617188-migration';
import { Migration1707721120491 } from './sqlite/1707721120491-migration';
import { Migrations1715255924893 } from './sqlite/1715255924893-migrations';
import { Migration1716290876069 } from './sqlite/1716290876069-migration';

export default {
  sqlite: [
    Migration1707721120491,
    Migrations1715255924893,
    Migration1716290876069,
  ],
  postgres: [
    Migration1712136836448,
    Migration1715254604937,
    Migration1716290617188,
  ],
};
