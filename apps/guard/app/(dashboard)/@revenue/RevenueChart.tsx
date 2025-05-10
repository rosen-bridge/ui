import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

import { useTheme } from '@rosen-bridge/ui-kit';
import { ChartPeriod } from '@rosen-ui/types';
import { getDecimalString, roundToPrecision } from '@rosen-ui/utils';
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
        data: slots.map(
          (slot) =>
            +getDecimalString(
              token.data.find((item) => item.label == slot.toString())
                ?.amount || '0',
              token.title.decimals,
            ),
        ),
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
