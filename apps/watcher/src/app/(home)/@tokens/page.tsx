'use client';

import { TokensCard } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getAddressUrl } from '@rosen-ui/utils';
import useSWR from 'swr';

import { useInfo } from '@/hooks';
import { ApiAddressAssetsResponse } from '@/types/api';

const Tokens = () => {
  const { data: info } = useInfo();

  const { data, isLoading } = useSWR<ApiAddressAssetsResponse>(
    ['/address/assets', { offset: 0, limit: 5 }],
    fetcher,
  );

  return (
    <TokensCard
      tokens={data?.items.filter((token) => !!token.amount) ?? []}
      isLoading={isLoading}
      title="Tokens"
      href={getAddressUrl(NETWORKS.ergo.key, info?.address)}
    />
  );
};

export default Tokens;
