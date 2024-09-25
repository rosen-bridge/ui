'use client';

import useSWR from 'swr';

import { Grid, TokensCard } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import { ApiAddressAssetsResponse } from '@/_types/api';
import { NETWORKS } from '@rosen-ui/constants';

const Tokens = () => {
  const { data: ergoTokens, isLoading: isErogTokensLoading } =
    useSWR<ApiAddressAssetsResponse>(
      ['/assets', { chain: NETWORKS.ERGO }],
      fetcher,
    );

  const { data: cardanoTokens, isLoading: isCardanoTokensLoading } =
    useSWR<ApiAddressAssetsResponse>(
      ['/assets', { chain: NETWORKS.CARDANO }],
      fetcher,
    );

  return (
    <>
      <Grid item mobile={12} tablet={6}>
        <TokensCard
          tokens={ergoTokens?.items ?? []}
          isLoading={isErogTokensLoading}
          title="Ergo Tokens"
        />
      </Grid>
      <Grid item mobile={12} tablet={6}>
        <TokensCard
          tokens={cardanoTokens?.items ?? []}
          isLoading={isCardanoTokensLoading}
          title="Cardano Tokens"
        />
      </Grid>
    </>
  );
};

export default Tokens;
