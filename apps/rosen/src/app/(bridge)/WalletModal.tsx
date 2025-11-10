import { MouseEvent, useEffect, useState } from 'react';

import { Wallet } from '@rosen-bridge/icons';
import {
  Alert,
  Card,
  CardBody,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  EnhancedDialogTitle,
  Tooltip,
  Stack,
  SvgIcon,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';

import { useNetwork, useTransactionFormData, useWallet } from '@/hooks';

export type WalletModalProps = {
  open: boolean;
  onClose: () => void;
};

export const WalletModal = ({ open, onClose }: WalletModalProps) => {
  const [, forceUpdate] = useState('');

  const network = useNetwork();

  const transactionFormData = useTransactionFormData();

  const wallet = useWallet();

  useEffect(() => {
    if (!open) return;

    const timeout = setInterval(() => {
      forceUpdate(wallet.wallets.map((item) => item.isAvailable()).join(':'));
    }, 2000);

    return () => {
      clearInterval(timeout);
    };
  }, [open, wallet.wallets]);

  return (
    <Dialog open={open} maxWidth="laptop" onClose={onClose}>
      <EnhancedDialogTitle icon={<Wallet />} onClose={onClose}>
        Choose Wallet
      </EnhancedDialogTitle>
      <DialogContent>
        <DialogContentText>
          Please choose any of the supported wallets for{' '}
          {network.selectedSource?.name} chain.
        </DialogContentText>
        <Stack spacing={2} style={{ margin: '1rem 0' }}>
          <Alert severity="warning">
            It may be necessary to reload this page after the following
            extensions have been installed in order to connect to them.
          </Alert>
          {transactionFormData.sourceValue == NETWORKS.bitcoin.key && (
            <Alert severity="warning">
              We only support native SegWit addresses (P2WPKH or P2WSH) for the
              source address.
            </Alert>
          )}
        </Stack>
        <Stack direction="row" justify="center" spacing={2} wrap>
          {wallet.wallets.map((item) => {
            const Icon = item.iconReact;

            const isConnected = wallet.selected?.name === item.name;

            const handleClick = async (event: MouseEvent) => {
              event.preventDefault();

              if (isConnected) {
                wallet.disconnect();
              } else if (item.isAvailable() && wallet.select) {
                await wallet.select(item);
              }

              onClose();
            };

            return (
              <Card key={item.label} backgroundColor="background.paper">
                <CardBody>
                  <Tooltip title={item.name}>
                    <Stack align="center" spacing={3}>
                      <SvgIcon size={13}>
                        <Icon />
                      </SvgIcon>
                      <Button
                        variant="contained"
                        size="small"
                        style={{ width: '100%' }}
                        disabled={!item.isAvailable()}
                        color={isConnected ? 'inherit' : 'primary'}
                        onClick={handleClick}
                      >
                        {isConnected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </Stack>
                  </Tooltip>
                </CardBody>
              </Card>
            );
          })}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
