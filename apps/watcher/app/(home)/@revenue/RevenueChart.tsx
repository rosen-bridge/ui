import moment from 'moment';
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

import { useTheme } from '@rosen-bridge/ui-kit';
import { ChartPeriod } from '@rosen-ui/types';

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
    type: 'line' as const,
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
    shared: true,
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
const RevenueChart = ({ period, data }: RevenueChartProps) => {
  const theme = useTheme();

  const apexChartOptions = useMemo(
    () => ({
      ...baseChartOptions,
      xaxis: {
        ...baseChartOptions.xaxis,
        categories:
          data[0]?.data.map((datum) =>
            moment(+datum.label).format(getDateFormat(period)),
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
    [data, period, theme],
  );

  const apexChartSeries = useMemo(
    () =>
      data.map((tokenData) => ({
        name: tokenData.title as any,
        data: tokenData.data.map((datum) => +datum.amount),
      })),
    [data],
  );

  return (
    <Chart options={apexChartOptions} series={apexChartSeries} height={240} />
  );
};

export default RevenueChart;
