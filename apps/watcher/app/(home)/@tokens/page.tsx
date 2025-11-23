'use client';

import { TokensCard } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiAddressAssetsResponse } from '@/_types/api';

const Tokens = () => {
  const { data, isLoading } = useSWR<ApiAddressAssetsResponse>(
    ['/address/assets', { offset: 0, limit: 5 }],
    fetcher,
  );

  return (
    <TokensCard
      tokens={data?.items.filter((token) => !!token.amount) ?? []}
      isLoading={isLoading}
      title="Tokens"
    />
  );
};

export default Tokens;
