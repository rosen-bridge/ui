import moment from 'moment';

import { SWRConfigProps } from '@rosen-ui/swr-mock';
import { ChartPeriod } from '@rosen-ui/types';

import {
  ApiAddressAssetsResponse,
  ApiHealthStatusResponse,
  ApiInfoResponse,
  ApiRevenueChartResponse,
  ApiRevenueResponse,
  ApiSignResponse,
  ApiEventResponse as ApiOngoingEventResponse,
  ApiHistoryResponse as ApiHistoryEventResponse,
  EventBase,
  HistoryEvent,
  OngoingEvent,
} from '@/_types/api';

const info: ApiInfoResponse = {
  health: 'Unstable',
  balances: {
    hot: [
      {
        address: '3WvuxxkcM5gRhfktbKTn3Wvux1xkcM5gRhTn1WfktbGoSqpW',
        chain: 'Ergo',
        balance: {
          amount: 100 * 1e9,
          decimals: 9,
          tokenId: 'erg',
          name: 'erg',
          isNativeToken: true,
        },
      },
      {
        address:
          'addr1qyrgyu3x5vqul78qa2g9q8l62xxnnfyz64qawwelltuzagdhs2e6xhe9mn0j9xzhf3f63vd0ulm58820qp7s3q0ql92swdh27a',
        chain: 'Cardano',
        balance: {
          amount: 500 * 1e6,
          decimals: 6,
          tokenId: 'ada',
          name: 'ada',
          isNativeToken: true,
        },
      },
    ],
    cold: [
      {
        address: '3WvuxxkcM5gRhfktbKTn3Wvux1xkcM5gRhTn1WfktbGoSqpW',
        chain: 'Ergo',
        balance: {
          amount: 300 * 1e9,
          decimals: 9,
          tokenId: 'erg',
          name: 'erg',
          isNativeToken: true,
        },
      },
      {
        address:
          'addr1qyrgyu3x5vqul78qa2g9q8l62xxnnfyz64qawwelltuzagdhs2e6xhe9mn0j9xzhf3f63vd0ulm58820qp7s3q0ql92swdh27a',
        chain: 'Cardano',
        balance: {
          amount: 1500 * 1e6,
          decimals: 6,
          tokenId: 'ada',
          name: 'ada',
          isNativeToken: true,
        },
      },
    ],
  },
  rsnTokenId:
    '85baefff2eb9e45b04f8b4e6265e866773db6db5f9e8e30ce2cae1aa263b90gg',
};

const revenueChartWeekly: ApiRevenueChartResponse = [
  {
    title: {
      amount: 12345,
      decimals: 3,
      isNativeToken: true,
      tokenId: 'ERG',
    },
    data: Array(10)
      .fill(null)
      .map((_, index) => ({
        label: moment()
          .day(7 * index - 63)
          .valueOf()
          .toString(),
        amount: `${Math.round(Math.random() * 100)}`,
      })),
  },
  {
    title: {
      amount: 12345,
      decimals: 3,
      isNativeToken: false,
      tokenId:
        '6c1526b2a5ef010edb622719d9d7fbde8437a39543547c3effbe72ad33504cf1',
    },
    data: Array(10)
      .fill(null)
      .map((_, index) => ({
        label: moment()
          .day(7 * index - 63)
          .valueOf()
          .toString(),
        amount: `${Math.round(Math.random() * 500)}`,
      })),
  },
];

const revenueChartMonthly: ApiRevenueChartResponse = [
  {
    title: {
      amount: 12345,
      decimals: 3,
      isNativeToken: false,
      tokenId:
        '6c1526b2a5ef010edb622719d9d7fbde8437a39543547c3effbe72ad33504cf1',
    },
    data: Array(10)
      .fill(null)
      .map((_, index) => ({
        label: moment()
          .month(1 * index - 9)
          .date(1)
          .valueOf()
          .toString(),
        amount: `${Math.round(Math.random() * 400)}`,
      })),
  },
  {
    title: {
      amount: 12345,
      decimals: 3,
      isNativeToken: false,
      tokenId:
        '6c1526b2a5ef010edb622719d9d7fbde8437a39543547c3effbe72ad33504cf1',
    },
    data: Array(10)
      .fill(null)
      .map((_, index) => ({
        label: moment()
          .month(1 * index - 9)
          .date(1)
          .valueOf()
          .toString(),
        amount: `${Math.round(Math.random() * 2000)}`,
      })),
  },
];
const revenueChartYearly: ApiRevenueChartResponse = [
  {
    title: {
      amount: 12345,
      decimals: 3,
      isNativeToken: false,
      tokenId:
        '6c1526b2a5ef010edb622719d9d7fbde8437a39543547c3effbe72ad33504cf1',
    },
    data: Array(10)
      .fill(null)
      .map((_, index) => ({
        label: moment()
          .year(2023 + (1 * index - 9))
          .dayOfYear(1)
          .valueOf()
          .toString(),
        amount: `${Math.round(Math.random() * 5000)}`,
      })),
  },
  {
    title: {
      amount: 12345,
      decimals: 3,
      isNativeToken: false,
      tokenId:
        '6c1526b2a5ef010edb622719d9d7fbde8437a39543547c3effbe72ad33504cf1',
    },
    data: Array(10)
      .fill(null)
      .map((_, index) => ({
        label: moment()
          .year(2023 + (1 * index - 9))
          .dayOfYear(1)
          .valueOf()
          .toString(),
        amount: `${Math.round(Math.random() * 25000)}`,
      })),
  },
];
const revenueChart = {
  week: revenueChartWeekly,
  month: revenueChartMonthly,
  year: revenueChartYearly,
};

const sign: ApiSignResponse = 'OK';

const assets = [
  {
    name: 'awesome token',
    tokenId: '2162efc108a0aeba2c040a3a29b1e8573dc6b6d746d33e5fe9cf9ccc1796f630',
    amount: 10000,
    decimals: 2,
    chain: 'ergo',
    isNativeToken: false,
  },
  {
    tokenId: '91e9086194cd9144a1661c5820dd53869afd1711d4c5a305b568a452e86f81b1',
    amount: 2,
    decimals: 0,
    chain: 'ergo',
    isNativeToken: false,
  },
  {
    name: 'another awesome token',
    tokenId: 'c6cce2d65182c2e4343d942000263b75d103e6d56fea08ded6dfc25548c2d34d',
    amount: 200,
    decimals: 1,
    chain: 'ergo',
    isNativeToken: false,
  },
  {
    name: 'fakeRSN',
    tokenId: '6c1526b2a5ef010edb622719d9d7fbde8437a39543547c3effbe72ad33504cf1',
    amount: 20,
    decimals: 5,
    chain: 'cardano',
    isNativeToken: false,
  },
];

const healthStatus: ApiHealthStatusResponse = [
  {
    status: 'Unstable',
    lastCheck: '2023-06-26T11:15:43.189Z',
    id: 'error logs',
  },
  {
    status: 'Healthy',
    lastCheck: '2023-06-26T11:15:43.642Z',
    id: 'Wid Check',
  },
  {
    status: 'Healthy',
    lastCheck: '2023-06-26T11:15:43.509Z',
    id: 'Native Asset erg Check',
  },
  {
    status: 'Broken',
    description:
      'Service has stopped working. [ergo-node] scanner is out of sync.\nPlease check the scanner status, [3487] blocks are created but not scanned.\n',
    lastCheck: '2023-06-26T11:15:43.544Z',
    id: 'Scanner ergo-node Sync Check',
  },
  {
    status: 'Healthy',
    lastCheck: '2023-06-26T11:15:45.206Z',
    id: 'Ergo Node Sync Check',
  },
  {
    status: 'Broken',
    description:
      'Service has stopped working. [cardano-koios] scanner is out of sync.\nPlease check the scanner status, [33283] blocks are created but not scanned.\n',
    lastCheck: '2023-06-26T11:15:43.553Z',
    id: 'Scanner cardano-koios Sync Check',
  },
];

const generateHistoryEventRecords = (
  numberOfRecords: number,
): HistoryEvent[] => {
  return new Array(numberOfRecords).fill(null).map((data, index) => ({
    eventId: `${Math.floor(Date.now() * Math.random())}`,
    txId: `${Math.floor(Date.now() * Math.random())}`,
    fromChain: 'Chain A',
    toChain: 'Chain B',
    fromAddress: '3WvuxxkcM5gRhfktbKTn3Wvux',
    toAddress: '3WvuxxkcM5gRhfktbKTn3Wvux',
    bridgeFee: '0.2',
    networkFee: '0.03',
    sourceTxId: 'sourceId1234',
    paymentTxId: 'asdsadfasdfasdfsadfasdf',
    rewardTxId: 'asdfasdfasdfasdfasdfasdfas',
    sourceChainToken: {
      amount: 1000,
      tokenId: '123',
      decimals: 2,
      name: 'hello',
      isNativeToken: false,
    },
  }));
};

const generateOngoingEventRecords = (
  numberOfRecords: number,
): OngoingEvent[] => {
  return new Array(numberOfRecords).fill(null).map((data, index) => ({
    eventId: `${Math.floor(Date.now() * Math.random())}`,
    txId: `${Math.floor(Date.now() * Math.random())}`,
    fromChain: 'Chain A',
    toChain: 'Chain B',
    fromAddress: '3WvuxxkcM5gRhfktbKTn3Wvux',
    toAddress: '3WvuxxkcM5gRhfktbKTn3Wvux',
    bridgeFee: '0.2',
    networkFee: '0.03',
    sourceTxId: 'sourceId1234',
    status: 'completed',
    sourceChainToken: {
      amount: 1000,
      tokenId: '123',
      decimals: 2,
      name: 'hello',
      isNativeToken: false,
    },
  }));
};

const generateRevenueRecords = (numberOfRecords: number) => {
  return new Array(numberOfRecords).fill(null).map((data, index) => ({
    id: index,
    rewardTxId:
      '95baefff2eb9e45b04f8b4e6265e866773db6db5f9e8e30ce2cae1aa263b90f7',
    lockTxId:
      '85baefff2eb9e45b04f8b4e6265e866773db6db5f9e8e30ce2cae1aa263b90f7',
    eventId: '85baefff2eb9e45b04f8b4e6265e866773db6db5f9e8e30ce2cae1aa263b90f7',
    lockHeight: 100,
    fromChain: 'Chain A',
    toChain: 'Chain B',
    fromAddress: '3WvuxxkcM5gRhfktbKTn3Wvux',
    toAddress: '3WvuxxkcM5gRhfktbKTn3Wvux',
    amount: '0.1',
    bridgeFee: '0.002',
    networkFee: '0.003',
    lockToken: {
      tokenId:
        '15baefff2eb9e45b04f8b4e6265e866773db6db5f9e8e30ce2cae1aa263b90f7',
      amount: 10000,
      decimals: 3,
      name: 'hello',
      isNativeToken: false,
    },
    ergoSideTokenId:
      '85baefff2eb9e45b04f8b4e6265e866773db6db5f9e8e30ce2cae1aa263b90gg',
    height: 100,
    timestamp: Date.now(),
    status: 'Done',
    revenues: [],
  }));
};

const revenues: ApiRevenueResponse = {
  total: 100,
  items: generateRevenueRecords(100),
};

const events: ApiOngoingEventResponse = {
  total: 100,
  items: generateOngoingEventRecords(100),
};

const history: ApiHistoryEventResponse = {
  total: 100,
  items: generateHistoryEventRecords(100),
};

const mockedData: SWRConfigProps['fakeData'] = {
  withStringKeys: {
    '/info': info,
    '/revenue/chart': revenueChart,
    '/sign': sign,
    '/health/status': healthStatus,
  },
  withObjectKeys: {
    '/revenue/chart': ({ period }: { period: ChartPeriod }) => {
      return revenueChart[period];
    },

    '/assets': ({ offset, limit, chain }): ApiAddressAssetsResponse => {
      const filteredData = chain
        ? assets.filter((asset) => asset.chain === chain)
        : assets;

      const pageData = filteredData;
      offset && limit
        ? filteredData.slice(offset, limit + offset)
        : filteredData;

      return {
        total: filteredData.length,
        items: pageData,
      };
    },
    '/event/ongoing': ({ offset, limit }) => {
      return {
        ...events,
        items: events.items.slice(offset, limit + offset),
      };
    },
    '/event/history': ({ offset, limit }) => {
      return {
        ...history,
        items: history.items.slice(offset, limit + offset),
      };
    },
    '/revenue/history': ({ offset, limit }) => {
      return {
        ...revenues,
        items: revenues.items.slice(offset, limit + offset),
      };
    },
  },
};

export default mockedData;
