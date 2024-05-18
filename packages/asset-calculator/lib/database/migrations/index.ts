import { Migration1712136836448 } from './postgres/1712136836448-migration';
import { Migration1715254604937 } from './postgres/1715254604937-migration';
import { Migration1707721120491 } from './sqlite/1707721120491-migration';
import { Migrations1715255924893 } from './sqlite/1715255924893-migrations';

export default {
  sqlite: [Migration1707721120491, Migrations1715255924893],
  postgres: [Migration1712136836448, Migration1715254604937],
};
