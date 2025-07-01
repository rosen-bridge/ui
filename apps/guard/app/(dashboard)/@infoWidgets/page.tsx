'use client';

import { Stack } from '@rosen-bridge/ui-kit';

import { useInfo } from '@/_hooks/useInfo';

import { HealthWidget } from './HealthWidget';
import { WalletWidget } from './WalletWidget';

const InfoWidgets = () => {
  const { data: info, isLoading } = useInfo();

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
          tokenInfoWithAddresses={info?.balances.hot ?? []}
          isLoading={isLoading}
        />
        <WalletWidget
          title="Cold Wallet"
          color="tertiary"
          tokenInfoWithAddresses={info?.balances.cold ?? []}
          isLoading={isLoading}
        />
      </Stack>
    </Stack>
  );
};

export default InfoWidgets;
