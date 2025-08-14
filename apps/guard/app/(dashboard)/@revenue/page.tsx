'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';

import {
  Card2,
  Card2Header,
  Card2Title,
  Card2Body,
  Typography,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { ChartPeriod } from '@rosen-ui/types';
import useSWR from 'swr';

import { ApiRevenueChartResponse } from '@/_types/api';

import { PeriodSelect } from './PeriodSelect';
import { RevenueChartSkeleton } from './RevenueChartSkeleton';

/**
 * This is required because revenue chart cannot be pre-rendered in next and
 * throws an error
 */
const RevenueChart = dynamic(
  () => import('./RevenueChart').then((mod) => mod.RevenueChart),
  { ssr: false },
);

const Revenue = () => {
  const [period, setPeriod] = useState<ChartPeriod>('week');
  const { data, isLoading } = useSWR<ApiRevenueChartResponse>(
    ['/revenue/chart', { period }],
    fetcher,
  );

  return (
    <Card2 backgroundColor="background.paper">
      <Card2Header
        action={<PeriodSelect period={period} setPeriod={setPeriod} />}
      >
        <Card2Title>
          <Typography variant="h5" fontWeight="bold">
            Revenue
          </Typography>
        </Card2Title>
      </Card2Header>
      <Card2Body>
        {isLoading ? (
          <RevenueChartSkeleton />
        ) : (
          data && <RevenueChart period={period} data={data} />
        )}
      </Card2Body>
    </Card2>
  );
};

export default Revenue;
