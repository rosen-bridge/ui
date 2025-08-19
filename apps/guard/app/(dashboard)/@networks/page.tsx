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
import { fetcher } from '@rosen-ui/swr-helpers';
import { getDecimalString } from '@rosen-ui/utils';
import useSWR from 'swr';

import { NetworkCard } from '@/(dashboard)/@networks/NetworkCard';
import { ApiBalanceResponse } from '@/_types/api';

export default function Networks() {
  const { data, isLoading } = useSWR<ApiBalanceResponse>('/balance', fetcher);

  const carouselSize = useMemo(
    () => ({ desktop: '20%', laptop: '31.5%', tablet: '42%', mobile: '100%' }),
    [],
  );

  const carouselItems = useMemo(() => {
    if (!data) {
      return Array.from({ length: 6 }).map((_, i) => (
        <CarouselItem key={i} size={carouselSize}>
          <NetworkCard isLoading />
        </CarouselItem>
      ));
    }

    const filteredHot = data.hot.filter(
      (item) => item.chain === 'ergo' && item.balance.isNativeToken,
    );
    const filteredCold = data.cold.filter(
      (item) => item.chain === 'ergo' && item.balance.isNativeToken,
    );

    return filteredHot.map((hotItem, i) => {
      const coldItem = filteredCold[i];

      const hotAmount = Number(
        getDecimalString(
          hotItem.balance.amount.toString(),
          hotItem.balance.decimals,
          3,
        ),
      );
      const coldAmount = coldItem
        ? Number(
            getDecimalString(
              coldItem.balance.amount.toString(),
              coldItem.balance.decimals,
              3,
            ),
          )
        : undefined;

      return (
        <CarouselItem key={i} size={carouselSize}>
          <NetworkCard
            isLoading={isLoading}
            network={hotItem.chain}
            hot={{
              amount: hotAmount,
              address: hotItem.address,
              link: hotItem.address,
              unit: hotItem.balance.name ?? 'N/A',
            }}
            cold={
              coldItem
                ? {
                    amount: coldAmount!,
                    address: coldItem.address,
                    link: coldItem.address,
                    unit: coldItem.balance.name ?? 'N/A',
                  }
                : undefined
            }
          />
        </CarouselItem>
      );
    });
  }, [data, isLoading, carouselSize]);

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

      <Carousel>{carouselItems}</Carousel>
    </CarouselProvider>
  );
}
