import { Migration1740674459019 } from './postgres/1740674459019-migration';
import { Migration1740718614292 } from './sqlite/1740718614292-migration';

export default {
  postgres: [Migration1740674459019],
  sqlite: [Migration1740718614292],
};
