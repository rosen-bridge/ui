'use client';

import useSWR from 'swr';

import { TokensCard } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import { ApiAddressAssetsResponse } from '@/_types/api';

const Tokens = () => {
  const { data, isLoading } = useSWR<ApiAddressAssetsResponse>(
    ['/address/assets', { offset: 0, limit: 6 }],
    fetcher,
  );

  return (
    <TokensCard
      tokens={data?.items ?? []}
      isLoading={isLoading}
      title="Tokens"
    />
  );
};

export default Tokens;
