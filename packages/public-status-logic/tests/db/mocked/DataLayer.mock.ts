/* eslint-disable @typescript-eslint/no-explicit-any */
import { mockAggregatedStatus } from '../../testData';

// stub holders for repositories and utils
let TxRepository = {
  insertOne: vi.fn(() => Promise.resolve()),
};
let GuardStatusRepository = {
  getMany: vi.fn(() => Promise.resolve<any[]>([])),
  upsertOne: vi.fn(() => Promise.resolve()),
};
let GuardStatusChangedRepository = {
  insertOne: vi.fn(() => Promise.resolve()),
};
let AggregatedStatusRepository = {
  upsertOne: vi.fn(() => Promise.resolve()),
};
let AggregatedStatusChangedRepository = {
  insertOne: vi.fn(() => Promise.resolve()),
};
let Utils = {
  cloneFilterPush: vi.fn(
    (orig: any[], key: string, pk: string, newObj: any) => {
      return [...orig.filter(() => true), newObj];
    },
  ),
  calcAggregatedStatus: vi.fn(() => mockAggregatedStatus),
  aggregatedStatusesMatch: vi.fn(() => false),
};

// mock entity manager that returns a stub repository by repository constructor
const createMockEntityManager = () => {
  return {
    withRepository: (repo: any) => {
      if (repo === TxRepository) return TxRepository;
      if (repo === GuardStatusRepository) return GuardStatusRepository;
      if (repo === GuardStatusChangedRepository)
        return GuardStatusChangedRepository;
      if (repo === AggregatedStatusRepository)
        return AggregatedStatusRepository;
      if (repo === AggregatedStatusChangedRepository)
        return AggregatedStatusChangedRepository;
      throw new Error('wrong repository');
    },
  };
};

// stub dataSource and its manager.transaction method
const dataSource = {
  manager: {
    transaction: async (cb: (em: any) => Promise<void>) => {
      const mockEntityManager = createMockEntityManager();
      await cb(mockEntityManager);
    },
  },
};

vi.mock('../../../src/utils', () => {
  return {
    Utils,
  };
});
vi.mock('../../../src/db/dataSource', () => {
  return {
    dataSource,
  };
});
vi.mock('../../../src/db/repositories/TxRepository', () => {
  return {
    TxRepository,
  };
});
vi.mock('../../../src/db/repositories/GuardStatusRepository', () => {
  return {
    GuardStatusRepository,
  };
});
vi.mock('../../../src/db/repositories/GuardStatusChangedRepository', () => {
  return {
    GuardStatusChangedRepository,
  };
});
vi.mock('../../../src/db/repositories/AggregatedStatusRepository', () => {
  return {
    AggregatedStatusRepository,
  };
});
vi.mock(
  '../../../src/db/repositories/AggregatedStatusChangedRepository',
  () => {
    return {
      AggregatedStatusChangedRepository,
    };
  },
);

export {
  Utils,
  dataSource,
  TxRepository,
  GuardStatusRepository,
  GuardStatusChangedRepository,
  AggregatedStatusRepository,
  AggregatedStatusChangedRepository,
};
