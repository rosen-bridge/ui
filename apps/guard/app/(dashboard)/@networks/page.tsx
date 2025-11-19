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
import { NETWORKS } from '@rosen-ui/constants';

import { Item } from './Item';

const Networks = () => {
  const carouselSize = useMemo(
    () => ({
      desktop: 'calc(25% - 3rem / 4)',
      laptop: 'calc(33.33333% - 3rem / 4)',
      tablet: 'calc(50% - 2rem / 3)',
      mobile: '100%',
    }),
    [],
  );

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
        {Object.values(NETWORKS)
          .sort((a, b) => a.index - b.index)
          .map((network) => (
            <CarouselItem key={network.key} size={carouselSize}>
              <Item network={network.key} />
            </CarouselItem>
          ))}
      </Carousel>
    </CarouselProvider>
  );
};

export default Networks;
