import moment from 'moment';

import { SWRConfigProps } from '@rosen-ui/swr-mock';
import { ChartPeriod } from '@rosen-ui/types';

import {
  ApiInfoResponse,
  ApiRevenueChartResponse,
  ApiSignResponse,
} from '@/_types/api';

const info: ApiInfoResponse = {
  health: 'Unstable',
  hot: {
    balance: '1000',
    address: '3WvuxxkcM5gRhfktbKTn3Wvux1xkcM5gRhTn1WfktbGoSqpW',
  },
  cold: {
    balance: '10000',
    address: '3WvuxxkcM5gRhfktbKTn3Wvux1xkcM5gRhTn1WfktbGoSqpX',
  },
};

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

const sign: ApiSignResponse = 'OK';

const mockedData: SWRConfigProps['fakeData'] = {
  withStringKeys: {
    '/info': info,
    '/revenue/chart': revenueChart,
    '/sign': sign,
  },
  withObjectKeys: {
    '/revenue/chart': ({ period }: { period: ChartPeriod }) => {
      return revenueChart[period];
    },
  },
};

export default mockedData;
