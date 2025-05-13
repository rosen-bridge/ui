import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

import { useTheme } from '@rosen-bridge/ui-kit';
import { ChartPeriod } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';
import moment from 'moment';

import { ApiRevenueChartResponse } from '@/_types/api';

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
    return data
      .map((token) => token.data)
      .flat()
      .map((item) => +item.label)
      .filter((item, index, items) => items.indexOf(item) == index)
      .sort((a, b) => a - b);
  }, [data]);

  const incrementDate = (date: number, period: ChartPeriod): Date => {
    const result = new Date(date);

    switch (period) {
      case 'week':
        result.setUTCDate(result.getUTCDate() + 7);
        break;
      case 'month':
        result.setUTCMonth(result.getUTCMonth() + 1);
        break;
      case 'year':
        result.setUTCFullYear(result.getUTCFullYear() + 1);
        break;
    }

    return result;
  };

  const normalizeDate = (timestamp: number, period: ChartPeriod): Date => {
    const result = new Date(timestamp);

    switch (period) {
      case 'week': {
        const day = result.getUTCDay();
        const diff = (day === 0 ? -6 : 1) - day;
        result.setUTCDate(result.getUTCDate() + diff);
        break;
      }
      case 'month':
        result.setUTCDate(1);
        break;
      case 'year':
        result.setUTCMonth(0, 1);
        break;
    }

    result.setUTCHours(0, 0, 0, 0);

    return result;
  };

  const slotsInPeriod = useMemo(() => {
    if (slots.length === 0) return {};

    const min = slots[0];
    const max = slots[slots.length - 1];

    const start = normalizeDate(min, period).getTime();
    const end = normalizeDate(max, period).getTime();

    const groups = {} as { [key: number]: number[] };

    for (const slot of slots) {
      const key = normalizeDate(slot, period).getTime();

      groups[key] ||= [];

      groups[key].push(slot);
    }

    let current = start;

    while (current <= end) {
      groups[current] ||= [];
      current = incrementDate(current, period).getTime();
    }

    return groups;
  }, [period, slots]);

  const slotsInPeriodKeys = useMemo(() => {
    return Object.keys(slotsInPeriod)
      .map(Number)
      .sort((a, b) => a - b);
  }, [slotsInPeriod]);

  const apexChartOptions = useMemo(
    () => ({
      ...baseChartOptions,
      xaxis: {
        ...baseChartOptions.xaxis,
        categories:
          slotsInPeriodKeys.map((slot) =>
            moment(+slot).format(getDateFormat(period)),
          ) ?? [],
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
    [period, slotsInPeriodKeys, theme],
  );

  const apexChartSeries = useMemo(
    () =>
      data.map((token) => ({
        name: token.title.name,
        data: slotsInPeriodKeys.map((key) => {
          const amount = token.data
            .filter((item) => slotsInPeriod[key].includes(+item.label))
            .reduce((sum, item) => sum + Number(item.amount), 0);

          return +getDecimalString(amount.toString(), token.title.decimals);
        }),
      })),
    [data, slotsInPeriod, slotsInPeriodKeys],
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
