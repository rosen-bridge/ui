'use client';

import React, { useMemo } from 'react';

import {
  Carousel,
  CarouselButton,
  CarouselIndicators,
  CarouselItem,
  CarouselProvider,
  Stack,
  Typography,
} from '@rosen-bridge/ui-kit';
import { NETWORKS_KEYS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiBalanceResponse } from '@/_types/api';

import { Item } from './Item';

const Networks = () => {
  const { data, isLoading } = useSWR<ApiBalanceResponse>('/balance', fetcher);

  const carouselSize = useMemo(
    () => ({
      desktop: 'calc(25% - 3rem / 4)',
      laptop: 'calc(33.33333% - 3rem / 4)',
      tablet: 'calc(50% - 2rem / 3)',
      mobile: '100%',
    }),
    [],
  );

  const items = useMemo(() => {
    return NETWORKS_KEYS.filter((key) => key != 'bitcoin-runes').map((key) => {
      const cold = data?.cold.find(
        (item) => item.chain === key && item.balance.isNativeToken,
      );

      const hot = data?.hot.find(
        (item) => item.chain === key && item.balance.isNativeToken,
      );

      const network = key;

      return { cold, hot, network };
    });
  }, [data]);

  return (
    <CarouselProvider>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h2" fontWeight="300" color="text.secondary">
          Networks
        </Typography>
        <Stack direction="row" alignItems="center" gap="0.5rem">
          <CarouselButton type="prev" />
          <CarouselIndicators />
          <CarouselButton type="next" />
        </Stack>
      </Stack>
      <Carousel>
        {items.map((item) => (
          <CarouselItem key={item.network} size={carouselSize}>
            <Item loading={isLoading} {...item} />
          </CarouselItem>
        ))}
      </Carousel>
    </CarouselProvider>
  );
};

export default Networks;
