'use client';

import React, { useState } from 'react';
import useSWR from 'swr';

import { FullCard } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import PeriodSelect from './PeriodSelect';
import RevenueChart from './RevenueChart';
import RevenueChartSkeleton from './RevenueChartSkeleton';

import { ChartPeriod } from '@/_types';
import { ApiRevenueChartResponse } from '@/_types/api';

const Revenue = () => {
  const [period, setPeriod] = useState<ChartPeriod>('week');
  const { data, isLoading } = useSWR<ApiRevenueChartResponse>(
    ['/revenue/chart', { period }],
    fetcher
  );

  return (
    <FullCard
      headerActions={<PeriodSelect period={period} setPeriod={setPeriod} />}
      title="Revenue"
    >
      {isLoading ? (
        <RevenueChartSkeleton />
      ) : (
        data && <RevenueChart period={period} data={data} />
      )}
    </FullCard>
  );
};

export default Revenue;
