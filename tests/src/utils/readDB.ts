import Papa from 'papaparse';

import {
  AggregatedStatusChangedRecord,
  AggregatedStatusRecord,
  Expectations,
  GuardStatusChangedRecord,
  GuardStatusRecord,
  TxRecord,
} from '../types';
import { command } from './command';

const parse = <
  T extends {
    txId?: string;
    txStatus?: string;
    txChain?: string;
    insertedAt?: any;
    updatedAt?: any;
  },
>(
  str: string,
) => {
  const records = Papa.parse(str, {
    header: true,
    skipEmptyLines: true,
  }).data as T[];

  return records.map((record) => {
    // delete null tx fields
    if (record['txId'] === '') {
      delete record.txId;
      delete record.txStatus;
      delete record.txChain;
    }
    // parse number fields
    if (record['insertedAt']) {
      record.insertedAt = parseInt(record.insertedAt);
    }
    if (record['updatedAt']) {
      record.updatedAt = parseInt(record.updatedAt);
    }
    return record;
  });
};

const readCommand = async (table: string, sortField: string) => {
  return command(
    `echo 'SELECT * FROM public.${table} ORDER BY "${sortField}" ASC;' | psql -p 5432 -U public_status_test_user -d public_status_test --csv`,
  );
};

export const readDB = async () => {
  // guard status
  const guardStatusEntities = await readCommand(
    'guard_status_entity',
    'updatedAt',
  );

  // guard status changed
  const guardStatusChangedEntities = await readCommand(
    'guard_status_changed_entity',
    'id',
  );

  // aggregated status
  const aggregatedStatusEntities = await readCommand(
    'aggregated_status_entity',
    'updatedAt',
  );

  // aggregated status changed
  const aggregatedStatusChangedEntities = await readCommand(
    'aggregated_status_changed_entity',
    'id',
  );

  // tx
  const txEntities = await readCommand('tx_entity', 'insertedAt');

  const expectations: Expectations = {
    guardStatusEntities: parse<GuardStatusRecord>(guardStatusEntities.stdout),
    guardStatusChangedEntities: parse<GuardStatusChangedRecord>(
      guardStatusChangedEntities.stdout,
    ),
    aggregatedStatusEntities: parse<AggregatedStatusRecord>(
      aggregatedStatusEntities.stdout,
    ),
    aggregatedStatusChangedEntities: parse<AggregatedStatusChangedRecord>(
      aggregatedStatusChangedEntities.stdout,
    ),
    txEntities: parse<TxRecord>(txEntities.stdout),
  };

  return expectations;
};
