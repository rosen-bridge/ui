import { useState } from 'react';

import { Button, Card, CardBody, Icon, Text } from '@rosen-bridge/ui-kit';

import { useWallet } from '@/hooks';

import { WalletModal } from './WalletModal';

export const WalletInfo = () => {
  const wallet = useWallet();

  const [open, setOpen] = useState(false);

  return (
    <Card
      backgroundColor={
        wallet.state === 'CONNECTED' || wallet.state === 'DISCONNECTING'
          ? 'secondary-light'
          : 'primary-light'
      }
    >
      <CardBody
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        {wallet.state === 'IDLE' && (
          <Text color="text-secondary">Select source to see available wallets.</Text>
        )}
        {wallet.state === 'CONNECTING' && (
          <Text variant="body1" color="text-secondary">
            Connecting to wallet...
          </Text>
        )}
        {wallet.state === 'DISCONNECTING' && (
          <Text variant="body1" color="text-secondary">
            Disconnecting...
          </Text>
        )}
        {wallet.state === 'DISCONNECTED' && (
          <Button
            variant="text"
            startIcon={<Icon name="Wallet" />}
            style={{ marginLeft: '-8px' }}
            onClick={() => setOpen(true)}
          >
            Choose Wallet
          </Button>
        )}
        {wallet.state === 'CONNECTED' && (
          <>
            <Button
              color="inherit"
              startIcon={wallet.selected && <Icon as={wallet.selected.iconReact} />}
              style={{ marginLeft: '-8px', textTransform: 'none' }}
              onClick={() => setOpen(true)}
            >
              {wallet.selected?.label}
            </Button>
            <Button
              color="secondary"
              startIcon={<Icon name="LinkBroken" />}
              style={{ marginRight: '-8px' }}
              onClick={() => wallet.disconnect()}
            >
              Disconnect
            </Button>
          </>
        )}
      </CardBody>
      <WalletModal open={open} onClose={() => setOpen(false)} />
    </Card>
  );
};
