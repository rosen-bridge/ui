/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GuardStatusEntity,
  GuardStatusChangedEntity,
  AggregatedStatusEntity,
  AggregatedStatusChangedEntity,
  TxEntity,
} from '../../../src';
import AggregatedStatusChangedHandlerMod from '../../../src/db/handlers/AggregatedStatusChangedHandler';
import AggregatedStatusHandlerMod from '../../../src/db/handlers/AggregatedStatusHandler';
import GuardStatusChangedHandlerMod from '../../../src/db/handlers/GuardStatusChangedHandler';
import GuardStatusHandlerMod from '../../../src/db/handlers/GuardStatusHandler';
import TxHandlerMod from '../../../src/db/handlers/TxHandler';
import { Utils } from '../../../src/utils';

vi.mock('../../../src/db/DataSourceHandler', () => ({
  DataSourceHandler: {
    getInstance: () => ({
      dataSource: {
        manager: {
          transaction: async (cb: (em: any) => Promise<void>) => {
            const mockEntityManager = {
              getRepository: (entity: any) => {
                if (entity === TxEntity) return {};
                if (entity === GuardStatusEntity) return {};
                if (entity === GuardStatusChangedEntity) return {};
                if (entity === AggregatedStatusEntity) return {};
                if (entity === AggregatedStatusChangedEntity) return {};
                throw new Error('wrong repository');
              },
            };
            await cb(mockEntityManager);
          },
        },
      },
    }),
  },
}));

const cloneFilterPushSpy = vi
  .spyOn(Utils, 'cloneFilterPush')
  .mockImplementation((orig: any[], key: string, pk: string, newObj: any) => {
    return [...orig.filter(() => true), newObj];
  });
const calcAggregatedStatusSpy = vi
  .spyOn(Utils, 'calcAggregatedStatus')
  .mockRejectedValue('not mocked');
const aggregatedStatusesMatchSpy = vi
  .spyOn(Utils, 'aggregatedStatusesMatch')
  .mockReturnValue(false);

//
const TxHandler = {
  insertOne: vi.fn().mockResolvedValue(undefined),
};
vi.spyOn(TxHandlerMod, 'getInstance').mockReturnValue(TxHandler);

//
const GuardStatusHandler = {
  getOne: vi.fn().mockResolvedValue(undefined),
  getMany: vi.fn().mockResolvedValue([]),
  upsertOne: vi.fn().mockResolvedValue(undefined),
};
vi.spyOn(GuardStatusHandlerMod, 'getInstance').mockReturnValue(
  GuardStatusHandler,
);

//
const GuardStatusChangedHandler = {
  getLast: vi.fn().mockResolvedValue(undefined),
  getMany: vi.fn().mockResolvedValue([]),
  insertOne: vi.fn().mockResolvedValue(undefined),
};
vi.spyOn(GuardStatusChangedHandlerMod, 'getInstance').mockReturnValue(
  GuardStatusChangedHandler,
);

//
const AggregatedStatusHandler = {
  getOne: vi.fn().mockResolvedValue(undefined),
  getMany: vi.fn().mockResolvedValue([]),
  upsertOne: vi.fn().mockResolvedValue(undefined),
};
vi.spyOn(AggregatedStatusHandlerMod, 'getInstance').mockReturnValue(
  AggregatedStatusHandler,
);

//
const AggregatedStatusChangedHandler = {
  getLast: vi.fn().mockResolvedValue(undefined),
  getMany: vi.fn().mockResolvedValue([]),
  insertOne: vi.fn().mockResolvedValue(undefined),
};
vi.spyOn(AggregatedStatusChangedHandlerMod, 'getInstance').mockReturnValue(
  AggregatedStatusChangedHandler,
);

export {
  TxHandler,
  GuardStatusHandler,
  GuardStatusChangedHandler,
  AggregatedStatusHandler,
  AggregatedStatusChangedHandler,
  cloneFilterPushSpy,
  calcAggregatedStatusSpy,
  aggregatedStatusesMatchSpy,
};
