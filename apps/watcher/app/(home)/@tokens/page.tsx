'use client';

import { TokensCard } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getAddressUrl } from '@rosen-ui/utils';
import useSWR from 'swr';

import { ApiAddressAssetsResponse, ApiInfoResponse } from '@/_types/api';

const Tokens = () => {
  const { data: info } = useSWR<ApiInfoResponse>('/info', fetcher);

  const { data, isLoading } = useSWR<ApiAddressAssetsResponse>(
    ['/address/assets', { offset: 0, limit: 6 }],
    fetcher,
  );

  return (
    <TokensCard
      href={getAddressUrl(NETWORKS.ergo.key, info?.address)}
      tokens={data?.items.filter((token) => !!token.amount) ?? []}
      isLoading={isLoading}
      title="Tokens"
    />
  );
};

export default Tokens;
