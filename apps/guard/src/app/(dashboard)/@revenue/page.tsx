'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Skeleton,
  CardAction,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { ChartPeriod } from '@rosen-ui/types';
import useSWR from 'swr';

import { ApiRevenueChartResponse } from '@/types/api';

import { PeriodSelect } from './PeriodSelect';

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
    <Card>
      <CardHeader>
        <CardTitle variant="h5" fontWeight="bold">
          Revenue
        </CardTitle>
        <CardAction>
          <PeriodSelect period={period} setPeriod={setPeriod} />
        </CardAction>
      </CardHeader>
      <CardBody>
        {isLoading && (
          <Skeleton
            animation="wave"
            height={255}
            width="100%"
            variant="rounded"
          />
        )}
        {!isLoading && data && <RevenueChart period={period} data={data} />}
      </CardBody>
    </Card>
  );
};

export default Revenue;
