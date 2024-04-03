import { Migration1712136836448 } from './postgres/1712136836448-migration';
import { Migration1707721120491 } from './sqlite/1707721120491-migration';

export default {
  sqlite: [Migration1707721120491],
  postgres: [Migration1712136836448],
};
