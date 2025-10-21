'use client';

import { useMemo } from 'react';

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

import { ApiBalanceResponse } from '@/_types/api';

const Token = ({ chain }: { chain: Network }) => {
  const { data, isLoading } = useSWR<ApiBalanceResponse>(
    ['/balance', { chain }],
    fetcher,
  );

  const tokens = useMemo(() => {
    if (!data) return [];

    const tokenIds = [
      ...new Set(
        [...data.cold, ...data.hot]
          .filter(item => item.chain === chain)
          .map(item => item.balance.tokenId)
      )
    ];

    return tokenIds.map((id) => {
      const cold = data.cold.find(
        (item) => item.chain === chain && item.balance.tokenId === id,
      );

      const hot = data.hot.find(
        (item) => item.chain === chain && item.balance.tokenId === id,
      );

      const token = Object.assign({}, hot?.balance, cold?.balance, {
        amount: hot?.balance.amount || 0,
        coldAmount: cold?.balance.amount || 0,
      });

      return token;
    });
  }, [chain, data]);

  return (
    <TokensCard
      tokens={tokens}
      isLoading={isLoading}
      title={NETWORKS[chain].label}
    />
  );
};

const Tokens = () => {
  return (
    <Grid item mobile={12}>
      <CarouselProvider>
        <Stack spacing="0.5rem">
          <Stack direction="row" align="center" justify="between">
            <Typography variant="h5" fontWeight="bold">
              Tokens
            </Typography>
            <Stack direction="row" align="center" spacing="0.5rem">
              <CarouselButton type="prev" />
              <CarouselIndicators />
              <CarouselButton type="next" />
            </Stack>
          </Stack>
          <Carousel>
            {Object.values(NETWORKS)
              .filter((network) => network.hasTokenSupport)
              .sort((a, b) => a.index - b.index)
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
