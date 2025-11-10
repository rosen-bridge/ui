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

import { useBalance } from '@/_hooks/useBalance';

import { Item } from './Item';

const Networks = () => {
  const { data, isLoading } = useBalance();

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
    if (!data) return [];

    const { cold: coldData, hot: hotData } = data;

    const coldRunes = coldData.items.find(
      (item) =>
        item.chain === 'bitcoin-runes' && item.balance.tokenId === 'btc',
    );
    const hotRunes = hotData.items.find(
      (item) =>
        item.chain === 'bitcoin-runes' && item.balance.tokenId === 'btc',
    );

    return NETWORKS_KEYS.map((key) => {
      const cold =
        key === 'bitcoin-runes'
          ? coldRunes
          : coldData.items.find(
              (item) => item.chain === key && item.balance.isNativeToken,
            );

      const hot =
        key === 'bitcoin-runes'
          ? hotRunes
          : hotData.items.find(
              (item) => item.chain === key && item.balance.isNativeToken,
            );

      return { cold, hot, network: key };
    });
  }, [data]);

  return (
    <CarouselProvider>
      <Stack direction="row" align="center" justify="between">
        <Typography variant="h2" fontWeight="300" color="text.secondary">
          Networks
        </Typography>
        <Stack direction="row" align="center" spacing="0.5rem">
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
