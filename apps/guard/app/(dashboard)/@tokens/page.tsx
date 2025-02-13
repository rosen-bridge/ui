'use client';

import { Grid, TokensCard } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiAddressAssetsResponse } from '@/_types/api';

const Tokens = () => {
  const { data: ergoTokens, isLoading: isErogTokensLoading } =
    useSWR<ApiAddressAssetsResponse>(
      ['/assets', { chain: NETWORKS.ergo.key }],
      fetcher,
    );

  const { data: cardanoTokens, isLoading: isCardanoTokensLoading } =
    useSWR<ApiAddressAssetsResponse>(
      ['/assets', { chain: NETWORKS.cardano.key }],
      fetcher,
    );

  const { data: ethereumTokens, isLoading: isEthereumTokensLoading } =
    useSWR<ApiAddressAssetsResponse>(
      ['/assets', { chain: NETWORKS.ethereum.key }],
      fetcher,
    );

  return (
    <>
      <Grid item mobile={12} tablet={6} desktop={4}>
        <TokensCard
          tokens={ergoTokens?.items ?? []}
          isLoading={isErogTokensLoading}
          title="Ergo Tokens"
        />
      </Grid>
      <Grid item mobile={12} tablet={6} desktop={4}>
        <TokensCard
          tokens={cardanoTokens?.items ?? []}
          isLoading={isCardanoTokensLoading}
          title="Cardano Tokens"
        />
      </Grid>
      <Grid item mobile={12} tablet={6} desktop={4}>
        <TokensCard
          tokens={ethereumTokens?.items ?? []}
          isLoading={isEthereumTokensLoading}
          title="Ethereum Tokens"
        />
      </Grid>
    </>
  );
};

export default Tokens;
