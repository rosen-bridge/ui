import { PROCEED } from '@rosen-bridge/abstract-scanner';

const now = 1763288720000;

export const MockedBlockEntityData = [
  {
    height: 50,
    hash: 'hash50',
    parentHash: 'parent49',
    status: PROCEED,
    scanner: 'scannerA',
    timestamp: now + 100,
  },
  {
    height: 80,
    hash: 'hash80',
    parentHash: 'parent79',
    status: PROCEED,
    scanner: 'scannerA',
    timestamp: now + 200,
  },
  {
    height: 60,
    hash: 'hash60',
    parentHash: 'parent59',
    status: PROCEED,
    scanner: 'scannerB',
    timestamp: now + 300,
  },
];
