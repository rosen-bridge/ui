'use client';

import { useState } from 'react';

import {
  Alert,
  Avatar,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  styled,
} from '@rosen-bridge/ui-kit';

import useNetwork from '@/_hooks/useNetwork';
import { useTokenMap } from '@/_hooks/useTokenMap';
import useTransactionFees from '@/_hooks/useTransactionFees';
import useTransactionFormData from '@/_hooks/useTransactionFormData';
import useWallet from '@/_hooks/useWallet';

import { getTokenNameAndId } from '@/_utils';
import { ChooseWalletModal } from './ChooseWalletModal';
import { ConnectOrSubmitButton } from './ConnectOrSubmitButton';

/**
 * container component for asset prices
 */
const PriceItem = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: theme.spacing(1),
}));

/**
 * container for fees and alert
 */
const FeesContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));

/**
 * shows fees to the user and handles wallet transaction
 * and wallet connection
 */
export const BridgeTransaction = () => {
  const [chooseWalletsModalOpen, setChooseWalletsModalOpen] = useState(false);

  const { sourceValue, targetValue, tokenValue, amountValue } =
    useTransactionFormData();

  const tokenMap = useTokenMap();

  const {
    status,
    networkFeeRaw,
    bridgeFeeRaw,
    receivingAmountRaw,
    isLoading: isLoadingFees,
    minTransferRaw,
  } = useTransactionFees(sourceValue, targetValue, tokenValue, amountValue);
  const { setSelectedWallet, wallets, selectedWallet } = useWallet();

  const { selectedNetwork } = useNetwork();

  const tokenInfo =
    tokenValue && sourceValue && getTokenNameAndId(tokenValue, sourceValue);

  const idKey = sourceValue && tokenMap.getIdKey(sourceValue);
  const targetTokenSearchResults =
    tokenValue &&
    idKey &&
    tokenMap.search(sourceValue, {
      [idKey]: tokenValue[idKey],
    });
  const targetTokenInfo =
    targetValue && targetTokenSearchResults?.[0]?.[targetValue];

  const WalletIcon = selectedWallet?.icon;

  const renderFee = (
    title: string,
    unit: string,
    amount: string,
    color: string,
  ) => {
    return (
      <PriceItem sx={(theme) => ({ padding: theme.spacing(1.25, 0.5) })}>
        <Typography variant="h5"> {title} </Typography>

        <Grid container flexWrap="nowrap">
          <Typography color={color} fontWeight="bold">
            {isLoadingFees && sourceValue && targetValue && tokenValue
              ? 'Pending...'
              : +amount
                ? amount
                : '-'}
          </Typography>
          {!!+amount && (
            <Typography sx={(theme) => ({ margin: theme.spacing(0, 0.5) })}>
              {unit}
            </Typography>
          )}
        </Grid>
      </PriceItem>
    );
  };

  const renderWalletInfo = () => {
    if (!WalletIcon) return null;
    return (
      <PriceItem sx={(theme) => ({ padding: theme.spacing(1.25, 0.5) })}>
        <Typography
          sx={{
            padding: (theme) => theme.spacing(1, 0),
          }}
        >
          Wallet
        </Typography>
        <IconButton
          onClick={() => {
            setChooseWalletsModalOpen(true);
          }}
          sx={{
            borderRadius: 0,
            padding: (theme) => theme.spacing(1),
            margin: (theme) => theme.spacing(0),
          }}
        >
          <Grid container alignItems="center" justifyContent="center" gap={1}>
            <Avatar
              sx={{
                width: 18,
                height: 18,
                background: 'transparent',
              }}
            >
              <WalletIcon />
            </Avatar>
            <Typography>{selectedWallet.label}</Typography>
          </Grid>
        </IconButton>
      </PriceItem>
    );
  };

  const renderAlert = () => (
    <Alert
      severity="error"
      sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
    >
      <Tooltip title={status?.message}>
        <Typography
          sx={{
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {status?.message}
        </Typography>
      </Tooltip>
    </Alert>
  );

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="flex-end"
        flexWrap="nowrap"
        gap={2}
      >
        <FeesContainer>
          {renderWalletInfo()}
          {renderFee(
            'Transaction Fee',
            tokenInfo?.tokenName,
            networkFeeRaw || 'Pending',
            'primary',
          )}
          {renderFee(
            'Bridge Fee',
            tokenInfo?.tokenName,
            bridgeFeeRaw || 'Pending',
            'primary',
          )}
          {renderFee(
            'Min Transfer',
            tokenInfo?.tokenName,
            minTransferRaw || 'Pending',
            'primary',
          )}
          <Divider />
          {renderFee(
            'You will receive',
            targetTokenInfo?.name,
            receivingAmountRaw,
            'secondary',
          )}
          {status?.status === 'error' && renderAlert()}
        </FeesContainer>

        <Grid item container flexDirection="column">
          <ConnectOrSubmitButton
            setChooseWalletsModalOpen={setChooseWalletsModalOpen}
          />
        </Grid>
      </Grid>
      <ChooseWalletModal
        open={chooseWalletsModalOpen}
        chainName={selectedNetwork?.name}
        setSelectedWallet={setSelectedWallet}
        handleClose={() => setChooseWalletsModalOpen(false)}
        wallets={wallets || []}
      />
    </>
  );
};
