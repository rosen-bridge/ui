import moment from 'moment';

import { SWRConfigProps } from '@rosen-ui/swr-mock';
import { ApiEventResponse, ChartPeriod, Event } from '@rosen-ui/types';

import {
  ApiAddressAssetsResponse,
  ApiHealthStatusResponse,
  ApiInfoResponse,
  ApiObservationResponse,
  ApiPermitResponse,
  ApiRevenueChartResponse,
  ApiWithdrawResponse,
  ApiRevenueResponse,
} from '@/_types/api';

const info: ApiInfoResponse = {
  address: '3WvuxxkcM5gRhfktbKTn3Wvux1xkcM5gRhTn1WfktbGoSqpW',
  currentBalance: 150n,
  health: 'Unstable',
  network: 'ergo',
  permitCount: 100n,
  rsnTokenId:
    '6c1526b2a5ef010edb622719d9d7fbde8437a39543547c3effbe72ad33504cf1',
};

const addressAssets: ApiAddressAssetsResponse = [
  {
    name: 'awesome token',
    tokenId: '2162efc108a0aeba2c040a3a29b1e8573dc6b6d746d33e5fe9cf9ccc1796f630',
    amount: 10000n,
    decimals: 2,
  },
  {
    tokenId: '91e9086194cd9144a1661c5820dd53869afd1711d4c5a305b568a452e86f81b1',
    amount: 2n,
    decimals: 0,
  },
  {
    name: 'another awesome token',
    tokenId: 'c6cce2d65182c2e4343d942000263b75d103e6d56fea08ded6dfc25548c2d34d',
    amount: 200n,
    decimals: 1,
  },
  {
    name: 'fakeRSN',
    tokenId: '6c1526b2a5ef010edb622719d9d7fbde8437a39543547c3effbe72ad33504cf1',
    amount: 20n,
    decimals: 5,
  },
];

const revenueChartWeekly: ApiRevenueChartResponse = [
  {
    title: 'erg',
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
    title: 'ada',
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
    title: 'erg',
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
    title: 'ada',
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
    title: 'erg',
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
    title: 'erg',
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

const withdraw: ApiWithdrawResponse = 'OK';

const permit: ApiPermitResponse = {
  txId: '15baefff2eb9e45b04f8b4e6265e866773db6db5f9e8e30ce2cae1aa263b90f7',
};

const permitReturn = permit;

const generateObservationRecords = (numberOfRecords: number) => {
  return new Array(numberOfRecords).fill(null).map((data, index) => ({
    id: index,
    fromChain: 'Chain A',
    toChain: 'Chain B',
    fromAddress: '3WvuxxkcM5gRhfktbKTn3Wvux',
    toAddress: '3WvuxxkcM5gRhfktbKTn3Wvux',
    height: 10,
    amount: '100',
    networkFee: '0.7',
    bridgeFee: '0.2',
    sourceChainTokenId: '123',
    targetChainTokenId: '456',
    sourceTxId: 'asdlfsdfasdlf',
    sourceBlockId: 'sdlfjdfadlfjadlf',
    requestId: 'sdfsa-dlfadf-lajdf',
    block: '',
    extractor: '',
  }));
};

const generateEventRecords = (numberOfRecords: number): Event[] => {
  return new Array(numberOfRecords).fill(null).map((data, index) => ({
    id: index,
    eventId: `${Math.floor(Date.now() * Math.random())}`,
    txId: `${Math.floor(Date.now() * Math.random())}`,
    extractor: 'Extractor Text',
    boxId: `${Math.floor(Date.now() * Math.random())}`,
    boxSerialized: '{}',
    block: 'Block Text',
    height: 10,
    fromChain: 'Chain A',
    toChain: 'Chain B',
    fromAddress: '3WvuxxkcM5gRhfktbKTn3Wvux',
    toAddress: '3WvuxxkcM5gRhfktbKTn3Wvux',
    amount: '100',
    bridgeFee: '0.2',
    networkFee: '0.03',
    sourceChainTokenId: '123',
    sourceChainHeight: 20,
    targetChainTokenId: 'ab123',
    sourceTxId: 'ab1234',
    sourceBlockId: 'cd56789',
    WIDs: 'WIDs',
    spendBlock: '',
    spendHeight: 5,
    spendTxId: 'spendId1234',
  }));
};

const generateRevenueRecords = (numberOfRecords: number) => {
  return new Array(numberOfRecords).fill(null).map((data, index) => ({
    id: index,
    permitTxId:
      '95baefff2eb9e45b04f8b4e6265e866773db6db5f9e8e30ce2cae1aa263b90f7',
    eventId: '85baefff2eb9e45b04f8b4e6265e866773db6db5f9e8e30ce2cae1aa263b90f7',
    lockHeight: 100,
    fromChain: 'Chain A',
    toChain: 'Chain B',
    fromAddress: '3WvuxxkcM5gRhfktbKTn3Wvux',
    toAddress: '3WvuxxkcM5gRhfktbKTn3Wvux',
    amount: '0.1',
    bridgeFee: '0.002',
    networkFee: '0.003',
    tokenId: '15baefff2eb9e45b04f8b4e6265e866773db6db5f9e8e30ce2cae1aa263b90f7',
    lockTxId:
      '15baefff2eb9e45b04f8b4e6265e8663773db6db5f9e8e30ce2cae1aa263b90f8',
    height: 100,
    timestamp: Date.now(),
    status: 'Done',
  }));
};

const observations: ApiObservationResponse = {
  total: 100,
  items: generateObservationRecords(100),
};

const revenues: ApiRevenueResponse = {
  total: 100,
  items: generateRevenueRecords(100),
};

const events: ApiEventResponse = {
  total: 100,
  items: generateEventRecords(100),
};

const mockedData: SWRConfigProps['fakeData'] = {
  withStringKeys: {
    '/info': info,
    '/address/assets': addressAssets,
    '/health/status': healthStatus,
    '/withdraw': withdraw,
    '/permit': permit,
    '/permit/return': permitReturn,
    '/observation': observations,
  },
  withObjectKeys: {
    '/revenue/chart': ({ period }: { period: ChartPeriod }) => {
      return revenueChart[period];
    },
    '/observation': ({ offset, limit }) => {
      return {
        ...observations,
        items: observations.items.slice(offset, limit + offset),
      };
    },
    '/revenue': ({ offset, limit }) => {
      return {
        ...observations,
        items: observations.items.slice(offset, limit + offset),
      };
    },
    '/events': ({ offset, limit }) => {
      return {
        ...events,
        items: events.items.slice(offset, limit + offset),
      };
    },
  },
};

export default mockedData;
