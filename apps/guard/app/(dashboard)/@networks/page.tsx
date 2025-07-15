'use client';

import React from 'react';

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
import { ApiInfoResponse } from '@/_types/api';

export default function Networks() {
  const { data: info, isLoading } = useSWR<ApiInfoResponse>('/info', fetcher);
  return (
    <CarouselProvider>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight="bold">
          Networks
        </Typography>
        <Stack direction="row" alignItems="center" gap="0.5rem">
          <CarouselButton type="prev" />
          <CarouselIndicators />
          <CarouselButton type="next" />
        </Stack>
      </Stack>
      <Carousel>
        {Array.from({ length: 6 }).reduce<React.ReactNode[]>(
          (acc, hotItem, i) => {
            const coldItem = [i];
            acc.push(
              <CarouselItem
                key={i}
                size={{
                  desktop: '20%',
                  laptop: '31.5%',
                  tablet: '42%',
                  mobile: '100%',
                }}
              >
                <NetworkCard
                  network={'ethereum'}
                  isLoading
                  hot={{
                    amount: Number(getDecimalString('50170605', 7, 3)),
                    address:
                      'nB3L2PD3L6537eX5AD1cyBwCejh2jt8nMhuonRWUSfpS43fakUpHT1uZyioPnVQ5EJdVPPskaWygfdxiDqbv3js6LR4TDkJXpRdKDm3Kk2x1cUmvy1ma9cD9H8tap7rRNWcMnJD75fptM',
                    link: 'nB3L2PD3L6537eX5AD1cyBwCejh2jt8',
                    unit: 'BNB',
                  }}
                  cold={{
                    amount: Number(getDecimalString('50170605', 7, 3)),
                    address:
                      'nB3L2PD3L6537eX5AD1cyBwCejh2jt8nMhuonRWUSfpS43fakUpHT1uZyioPnVQ5EJdVPPskaWygfdxiDqbv3js6LR4TDkJXpRdKDm3Kk2x1cUmvy1ma9cD9H8tap7rRNWcMnJD75fptM',
                    link: 'nB3L2PD3L6537eX5AD1cyBwCejh2jt8',
                    unit: 'BNB',
                  }}
                />
              </CarouselItem>,
            );
            return acc;
          },
          [],
        )}
      </Carousel>
    </CarouselProvider>
  );
}
