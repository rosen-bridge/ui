import moment from 'moment';

import { SWRConfigProps } from '@rosen-ui/swr-mock';
import { ChartPeriod } from '@rosen-ui/types';

import {
  ApiAddressAssetsResponse,
  ApiHealthStatusResponse,
  ApiInfoResponse,
  ApiPermitResponse,
  ApiRevenueChartResponse,
  ApiWithdrawResponse,
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

const mockedData: SWRConfigProps['fakeData'] = {
  withStringKeys: {
    '/info': info,
    '/address/assets': addressAssets,
    '/health/status': healthStatus,
    '/withdraw': withdraw,
    '/permit': permit,
    '/permit/return': permitReturn,
  },
  withObjectKeys: {
    '/revenue/chart': ({ period }: { period: ChartPeriod }) => {
      return revenueChart[period];
    },
  },
};

export default mockedData;
