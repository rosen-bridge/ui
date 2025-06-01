import { FunctionComponent, useEffect, useState } from 'react';

import { LinkBroken, Wallet } from '@rosen-bridge/icons';
import {
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  SvgIcon,
  Typography,
} from '@rosen-bridge/ui-kit';

import { useTransactionFormData } from '@/_hooks';

export interface WalletInfoProps {
  icon?: FunctionComponent;
  label?: string;
  disconnect: () => void;
  onClick: () => void;
}

export const WalletInfo = ({
  icon: Icon,
  label,
  disconnect,
  onClick,
}: WalletInfoProps) => {
  const { sourceValue } = useTransactionFormData();
  const [isConnecting, setIsConnecting] = useState(false);

  const isSourceSelected = !!sourceValue;
  const isConnected = !!Icon && !!label;
  const showChooseWallet = isSourceSelected && !isConnecting && !isConnected;

  const shouldUseSecondaryBackground =
    (isConnected && !isConnecting) || (isSourceSelected && isConnecting);

  const handleChooseWallet = () => {
    setIsConnecting(true);
    onClick();
  };

  const handleDisconnect = () => {
    setIsConnecting(false);
    disconnect();
  };

  useEffect(() => {
    if (isConnecting && isConnected) {
      const timer = setTimeout(() => {
        setIsConnecting(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnecting, isConnected]);

  return (
    <Box
      sx={(theme) => ({
        gap: '8px',
        backgroundColor: shouldUseSecondaryBackground
          ? theme.palette.secondary.light
          : theme.palette.primary.light,
        padding: '8px 24px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      })}
    >
      {!isSourceSelected && (
        <Box sx={{ padding: '8px 0px' }}>
          <Typography variant="body2" color="text.secondary">
            Select source to see available wallets.
          </Typography>
        </Box>
      )}

      {showChooseWallet && (
        <Box
          sx={{
            padding: '8px 0px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '8px',
          }}
        >
          <SvgIcon
            sx={(theme) => ({
              color: theme.palette.primary.dark,
            })}
          >
            <Wallet width="24px" />
          </SvgIcon>
          <Button
            variant="text"
            onClick={handleChooseWallet}
            sx={(theme) => ({
              borderRadius: 1,
              padding: 0,
              minWidth: 'auto',
              color: theme.palette.primary.dark,
            })}
          >
            CHOOSE WALLET
          </Button>
        </Box>
      )}

      {isSourceSelected && isConnecting && (
        <Box sx={{ padding: '8px 0px' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            Connecting to
            {Icon && (
              <SvgIcon sx={{ fontSize: 'inherit', verticalAlign: 'middle' }}>
                <Icon />
              </SvgIcon>
            )}
            {label && <Typography>{label}</Typography>}
          </Typography>
        </Box>
      )}

      {isConnected && !isConnecting && (
        <>
          <IconButton
            sx={{
              borderRadius: 1,
              margin: 0,
            }}
            onClick={onClick}
          >
            <Grid container alignItems="center" justifyContent="center" gap={1}>
              <Avatar
                sx={{
                  width: 18,
                  height: 18,
                  background: 'transparent',
                }}
              >
                {Icon && <Icon />}
              </Avatar>
              <Typography>{label}</Typography>
            </Grid>
          </IconButton>

          <Button
            sx={{
              color: (theme) => theme.palette.secondary.dark,
              fill: (theme) => theme.palette.secondary.dark,
              borderRadius: 1,
              margin: 0,
            }}
            startIcon={<LinkBroken width="24px" />}
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </>
      )}
    </Box>
  );
};
