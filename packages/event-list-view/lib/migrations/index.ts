import { Migration1792259579000 } from './postgres/1792259579000-migration';
import { Migration1792259579002 } from './postgres/1792259579002-migration';
import { Migration1792259579001 } from './sqlite/1792259579001-migration';

export default {
  postgres: [Migration1792259579000, Migration1792259579002],
  sqlite: [Migration1792259579001],
};
