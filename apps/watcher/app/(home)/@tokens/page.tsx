'use client';

import useSWR from 'swr';

import { TokensCard } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import { ApiAddressAssetsResponse } from '@/_types/api';

const Tokens = () => {
  const { data: tokens, isLoading } = useSWR<ApiAddressAssetsResponse>(
    '/address/assets',
    fetcher
  );

  return (
    <TokensCard tokens={tokens ?? []} isLoading={isLoading} title="Tokens" />
  );
};

export default Tokens;
