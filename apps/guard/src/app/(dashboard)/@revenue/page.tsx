'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardHeader,
  CardTitle,
  Icon,
  Menu,
  MenuBody,
  MenuItem,
  MenuTrigger,
  Skeleton,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import type { ChartPeriod } from '@rosen-ui/types';
import useSWR from 'swr';

import type { ApiRevenueChartResponse } from '@/types/api';

const periodOptions = ['week', 'month', 'year'] as const;

const Loading = () => <Skeleton height={255} width="100%" variant="rounded" />;

/**
 * This is required because revenue chart cannot be pre-rendered in next and
 * throws an error
 */
const RevenueChart = dynamic(
  () => import('./RevenueChart').then((mod) => mod.RevenueChart),
  {
    ssr: false,
    loading: () => <Loading />,
  },
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
          <Menu>
            <MenuTrigger
              as={Button}
              size="small"
              endIcon={<Icon name="AngleDown" size="small" />}
            >
              {period}
            </MenuTrigger>
            <MenuBody offset={[0, 4]} placement="bottom-end">
              {periodOptions.map((periodOption) => (
                <MenuItem
                  key={periodOption}
                  selected={periodOption === period}
                  onClick={() => setPeriod(periodOption)}
                >
                  {periodOption}
                </MenuItem>
              ))}
            </MenuBody>
          </Menu>
        </CardAction>
      </CardHeader>
      <CardBody>
        {isLoading && <Loading />}
        {!isLoading && data && <RevenueChart period={period} data={data} />}
      </CardBody>
    </Card>
  );
};

export default Revenue;
