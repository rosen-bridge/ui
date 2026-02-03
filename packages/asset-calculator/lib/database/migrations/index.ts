import { Migration1712136836448 } from './postgres/1712136836448-migration';
import { Migration1715254604937 } from './postgres/1715254604937-migration';
import { Migration1716290617188 } from './postgres/1716290617188-migration';
import { Migration1719839526564 } from './postgres/1719839526564-migration';
import { Migration1757426014448 } from './postgres/1757426014448-migration';
import { Migration1762606291770 } from './postgres/1762606291770-migration';
import { Migration1767778012669 } from './postgres/1767778012669-migration';
import { Migration1707721120491 } from './sqlite/1707721120491-migration';
import { Migrations1715255924893 } from './sqlite/1715255924893-migrations';
import { Migration1716290876069 } from './sqlite/1716290876069-migration';
import { Migration1719839945219 } from './sqlite/1719839945219-migration';
import { Migration1757426872943 } from './sqlite/1757426872943-migration';
import { Migration1767776960633 } from './sqlite/1767776960633-migration';

export default {
  sqlite: [
    Migration1707721120491,
    Migrations1715255924893,
    Migration1716290876069,
    Migration1719839945219,
    Migration1757426872943,
    Migration1767776960633,
  ],
  postgres: [
    Migration1712136836448,
    Migration1715254604937,
    Migration1716290617188,
    Migration1719839526564,
    Migration1757426014448,
    Migration1762606291770,
    Migration1767778012669,
  ],
};
