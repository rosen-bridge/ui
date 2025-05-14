/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GuardStatusEntity,
  GuardStatusChangedEntity,
  AggregatedStatusEntity,
  AggregatedStatusChangedEntity,
  TxEntity,
} from '../../../src';
import AggregatedStatusActionMod from '../../../src/db/actions/AggregatedStatusAction';
import AggregatedStatusChangedActionMod from '../../../src/db/actions/AggregatedStatusChangedAction';
import GuardStatusActionMod from '../../../src/db/actions/GuardStatusAction';
import GuardStatusChangedActionMod from '../../../src/db/actions/GuardStatusChangedAction';
import TxActionMod from '../../../src/db/actions/TxAction';
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
const TxAction = {
  insertOne: vi.fn().mockResolvedValue(undefined),
};
vi.spyOn(TxActionMod, 'getInstance').mockReturnValue(TxAction);

//
const GuardStatusAction = {
  getOne: vi.fn().mockResolvedValue(undefined),
  getMany: vi.fn().mockResolvedValue([]),
  upsertOne: vi.fn().mockResolvedValue(undefined),
};
vi.spyOn(GuardStatusActionMod, 'getInstance').mockReturnValue(
  GuardStatusAction,
);

//
const GuardStatusChangedAction = {
  getLast: vi.fn().mockResolvedValue(undefined),
  getMany: vi.fn().mockResolvedValue([]),
  insertOne: vi.fn().mockResolvedValue(undefined),
};
vi.spyOn(GuardStatusChangedActionMod, 'getInstance').mockReturnValue(
  GuardStatusChangedAction,
);

//
const AggregatedStatusAction = {
  getOne: vi.fn().mockResolvedValue(undefined),
  getMany: vi.fn().mockResolvedValue([]),
  upsertOne: vi.fn().mockResolvedValue(undefined),
};
vi.spyOn(AggregatedStatusActionMod, 'getInstance').mockReturnValue(
  AggregatedStatusAction,
);

//
const AggregatedStatusChangedAction = {
  getLast: vi.fn().mockResolvedValue(undefined),
  getMany: vi.fn().mockResolvedValue([]),
  insertOne: vi.fn().mockResolvedValue(undefined),
};
vi.spyOn(AggregatedStatusChangedActionMod, 'getInstance').mockReturnValue(
  AggregatedStatusChangedAction,
);

export {
  TxAction,
  GuardStatusAction,
  GuardStatusChangedAction,
  AggregatedStatusAction,
  AggregatedStatusChangedAction,
  cloneFilterPushSpy,
  calcAggregatedStatusSpy,
  aggregatedStatusesMatchSpy,
};
