'use client';

import useSWR from 'swr';

import { Stack } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import HealthWidget from './HealthWidget';
import WalletWidget from './WalletWidget';

import { ApiInfoResponse } from '@/_types/api';

const InfoWidgets = () => {
  const { data: info, isLoading } = useSWR<ApiInfoResponse>('/info', fetcher);

  return (
    <Stack spacing={2}>
      <HealthWidget />
      <Stack
        spacing={2}
        direction={{ mobile: 'column', tablet: 'row', laptop: 'column' }}
      >
        <WalletWidget
          title="Hot Wallet"
          color="secondary"
          value={info?.hot.balance}
          address={info?.hot.address}
          isLoading={isLoading}
        />
        <WalletWidget
          title="Cold Wallet"
          color="info"
          value={info?.cold.balance}
          address={info?.cold.address}
          isLoading={isLoading}
        />
      </Stack>
    </Stack>
  );
};

export default InfoWidgets;
