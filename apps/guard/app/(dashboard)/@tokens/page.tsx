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
import { Network } from '@rosen-ui/types';

import { useBalance } from '@/_hooks/useBalance';

const Token = ({ chain }: { chain: Network }) => {
  const { data, isLoading } = useBalance(chain);

  const tokens = useMemo(() => {
    if (!data) return [];

    const tokenIds = [
      ...new Set(
        [...data.cold.items, ...data.hot.items]
          .filter((item) => item.chain === chain)
          .map((item) => item.balance.tokenId),
      ),
    ].slice(0, 5);

    return tokenIds.map((id) => {
      const cold = data.cold.items.find(
        (item) => item.chain === chain && item.balance.tokenId === id,
      );

      const hot = data.hot.items.find(
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
      chain={chain}
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
