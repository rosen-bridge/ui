'use client';

import { Stack } from '@rosen-bridge/ui-kit';

import { useBalance } from '@/_hooks/useBalance';

import { HealthWidget } from './HealthWidget';
import { WalletWidget } from './WalletWidget';

const InfoWidgets = () => {
  const { data: info, isLoading } = useBalance();

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
          tokenInfoWithAddresses={info?.hot ?? []}
          isLoading={isLoading}
        />
        <WalletWidget
          title="Cold Wallet"
          color="tertiary"
          tokenInfoWithAddresses={info?.cold ?? []}
          isLoading={isLoading}
        />
      </Stack>
    </Stack>
  );
};

export default InfoWidgets;
