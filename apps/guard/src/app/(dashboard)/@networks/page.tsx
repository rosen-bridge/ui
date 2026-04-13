'use client';

import { useMemo } from 'react';

import {
  Carousel,
  CarouselButton,
  CarouselIndicators,
  CarouselItem,
  CarouselItemProps,
  CarouselProvider,
  Stack,
  Typography,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';

import { Item } from './Item';

const Networks = () => {
  const rewrite = useMemo<CarouselItemProps['rewrite']>(
    () => ({
      desktop: { size: 'calc(25% - 3rem / 4)' },
      laptop: { size: 'calc(33.33333% - 3rem / 4)' },
      tablet: { size: 'calc(50% - 2rem / 3)' },
      mobile: { size: '100%' },
    }),
    [],
  );

  return (
    <CarouselProvider>
      <Stack direction="row" align="center" justify="between">
        <Typography variant="h2" fontWeight="300" color="text-secondary">
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
            <CarouselItem key={network.key} rewrite={rewrite}>
              <Item network={network.key} />
            </CarouselItem>
          ))}
      </Carousel>
    </CarouselProvider>
  );
};

export default Networks;
