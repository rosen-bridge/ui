import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

import { useTheme } from '@rosen-bridge/ui-kit';
import { ChartPeriod } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';
import moment from 'moment';

import { ApiRevenueChartResponse } from '@/types/api';

/**
 * get date format for a period to be used as chart x axis labels
 * @param period
 */
const getDateFormat = (period: ChartPeriod) =>
  period === 'week' ? 'D MMM' : period === 'month' ? 'MMM' : 'YYYY';

const baseChartOptions = {
  chart: {
    height: 350,
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
    background: 'transparent',
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth' as const,
    width: 4,
  },
  grid: {
    xaxis: {
      lines: {
        show: false,
      },
    },
  },
  xaxis: {
    tooltip: {
      enabled: false,
    },
  },
  tooltip: {
    enabled: true,
    x: {
      show: false,
    },
  },
};

interface RevenueChartProps {
  period: ChartPeriod;
  data: ApiRevenueChartResponse;
}
/**
 * render a revenue chart to be used in parent page
 * @param period
 * @param data
 */
export const RevenueChart = ({ period, data }: RevenueChartProps) => {
  const theme = useTheme();

  const slots = useMemo(() => {
    const raw = data
      .map((token) => token.data)
      .flat()
      .map((item) => +item.label)
      .filter((item, index, items) => items.indexOf(item) == index)
      .sort((a, b) => a - b);

    const min = raw[0];
    const max = raw[raw.length - 1];

    const result = [] as number[];

    let current = min;

    result.push(current);

    while (current < max) {
      const date = new Date(current);

      switch (period) {
        case 'week':
          date.setUTCDate(date.getUTCDate() + 7);
          break;
        case 'month':
          date.setUTCMonth(date.getUTCMonth() + 1);
          break;
        case 'year':
          date.setUTCFullYear(date.getUTCFullYear() + 1);
          break;
      }

      current = date.getTime();

      result.push(current);
    }

    return result;
  }, [data, period]);

  const apexChartOptions = useMemo(
    () => ({
      ...baseChartOptions,
      xaxis: {
        ...baseChartOptions.xaxis,
        categories:
          slots.map((slot) => moment(+slot).format(getDateFormat(period))) ??
          [],
      },
      theme: {
        mode: theme.palette.mode,
      },
      colors:
        theme.palette.mode === 'light'
          ? [
              theme.palette.primary.main,
              theme.palette.secondary.main,
              theme.palette.info.main,
              theme.palette.success.main,
              theme.palette.warning.main,
              theme.palette.error.main,
            ]
          : [
              theme.palette.primary.light,
              theme.palette.secondary.light,
              theme.palette.info.light,
              theme.palette.success.light,
              theme.palette.warning.light,
              theme.palette.error.light,
            ],
    }),
    [period, slots, theme],
  );

  const apexChartSeries = useMemo(
    () =>
      data.map((token) => ({
        name: token.title.name,
        data: slots.map((slot) => {
          const amount = token.data.find(
            (item) => item.label == slot.toString(),
          )?.amount;
          return +getDecimalString(amount, token.title.decimals);
        }),
      })),
    [data, slots],
  );

  return (
    <Chart
      type="bar"
      options={apexChartOptions}
      series={apexChartSeries}
      height={240}
    />
  );
};
