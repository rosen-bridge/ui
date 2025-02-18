'use client';

import {
  Carousel,
  CarouselButton,
  CarouselIndicators,
  CarouselItem,
  CarouselProvider,
  Grid,
  Stack,
  TokensCard,
  Typography,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { Network } from '@rosen-ui/types';
import useSWR from 'swr';

import { ApiAddressAssetsResponse } from '@/_types/api';

const Token = ({ chain }: { chain: Network }) => {
  const { data, isLoading } = useSWR<ApiAddressAssetsResponse>(
    ['/assets', { chain }],
    fetcher,
  );
  return (
    <TokensCard
      tokens={data?.items ?? []}
      isLoading={isLoading}
      title={NETWORKS[chain].label}
    />
  );
};

const Tokens = () => {
  return (
    <Grid item mobile={12}>
      <CarouselProvider>
        <Stack gap="0.5rem">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5" fontWeight="bold">
              Tokens
            </Typography>
            <Stack direction="row" alignItems="center" gap="0.5rem">
              <CarouselButton type="prev" />
              <CarouselIndicators />
              <CarouselButton type="next" />
            </Stack>
          </Stack>
          <Carousel>
            {Object.values(NETWORKS)
              .filter((network) => network.hasTokenSupport)
              .map((network) => (
                <CarouselItem
                  key={network.key}
                  size="clamp(400px, calc(50% - 0.75rem), 600px)"
                >
                  <Token chain={network.key} />
                </CarouselItem>
              ))}
          </Carousel>
        </Stack>
      </CarouselProvider>
    </Grid>
  );
};

export default Tokens;
