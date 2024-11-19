import moment from 'moment';
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

import { useTheme } from '@rosen-bridge/ui-kit';
import { ChartPeriod } from '@rosen-ui/types';
import { getDecimalString, roundToPrecision } from '@rosen-ui/utils';

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

  const reversedData = useMemo(
    () =>
      data
        .map((innerData) => ({
          ...innerData,
          data: innerData.data.toReversed(),
        }))
        .toReversed(),
    [data],
  );

  const apexChartOptions = useMemo(
    () => ({
      ...baseChartOptions,
      xaxis: {
        ...baseChartOptions.xaxis,
        categories:
          reversedData[0]?.data.map((datum) =>
            moment(+datum.label).format(getDateFormat(period)),
          ) ?? [],
      },
      yaxis: {
        labels: {
          formatter: (label: number) =>
            `${roundToPrecision(label, reversedData[0]?.title?.decimals || 0)}`,
        },
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
    [reversedData, period, theme],
  );

  const apexChartSeries = useMemo(
    () =>
      reversedData.toReversed().map((tokenData) => ({
        name: tokenData.title.name,
        data: tokenData.data.map(
          (datum) => +getDecimalString(datum.amount, tokenData.title.decimals),
        ),
      })),
    [reversedData],
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
