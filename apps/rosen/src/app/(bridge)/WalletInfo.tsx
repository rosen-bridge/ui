import { useState } from 'react';

import { LinkBroken } from '@rosen-bridge/icons';
import { Wallet } from '@rosen-bridge/icons';
import {
  Card,
  CardBody,
  Button,
  SvgIcon,
  Typography,
} from '@rosen-bridge/ui-kit';

import { useWallet } from '@/hooks';

import { WalletModal } from './WalletModal';

export const WalletInfo = () => {
  const wallet = useWallet();

  const [open, setOpen] = useState(false);

  const Icon = wallet.selected?.iconReact;

  return (
    <Card
      backgroundColor={
        wallet.state === 'CONNECTED' || wallet.state === 'DISCONNECTING'
          ? 'secondary.light'
          : 'primary.light'
      }
    >
      <CardBody
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
        }}
      >
        {wallet.state === 'IDLE' && (
          <Typography color="text.secondary" variant="body2">
            Select source to see available wallets.
          </Typography>
        )}
        {wallet.state === 'CONNECTING' && (
          <Typography color="text.secondary">
            Connecting to wallet...
          </Typography>
        )}
        {wallet.state === 'DISCONNECTING' && (
          <Typography color="text.secondary">Disconnecting...</Typography>
        )}
        {wallet.state === 'DISCONNECTED' && (
          <Button
            variant="text"
            startIcon={
              <SvgIcon>
                <Wallet />
              </SvgIcon>
            }
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
              startIcon={<SvgIcon size="24px">{Icon && <Icon />}</SvgIcon>}
              style={{ marginLeft: '-8px', textTransform: 'none' }}
              onClick={() => setOpen(true)}
            >
              {wallet.selected?.label}
            </Button>
            <Button
              color="secondary"
              startIcon={
                <SvgIcon size="24px">
                  <LinkBroken />
                </SvgIcon>
              }
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
