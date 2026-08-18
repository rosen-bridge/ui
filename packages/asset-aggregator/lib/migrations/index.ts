import {
  Migration1712136836448,
  Migration1715254604937,
  Migration1716290617188,
  Migration1719839526564,
  Migration1757426014448,
  Migration1767778012669,
} from './postgres';
import {
  Migration1707721120491,
  Migration1715255924893,
  Migration1716290876069,
  Migration1719839945219,
  Migration1757426872943,
  Migration1767776960633,
} from './sqlite';

export const migrations = {
  postgres: [
    Migration1712136836448,
    Migration1715254604937,
    Migration1716290617188,
    Migration1719839526564,
    Migration1757426014448,
    Migration1767778012669,
  ],
  sqlite: [
    Migration1707721120491,
    Migration1715255924893,
    Migration1719839945219,
    Migration1716290876069,
    Migration1757426872943,
    Migration1767776960633,
  ],
};
