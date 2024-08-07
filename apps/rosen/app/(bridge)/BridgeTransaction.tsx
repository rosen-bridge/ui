'use client';

import { useState } from 'react';

import { TokenMap } from '@rosen-bridge/tokens';
import {
  Alert,
  Avatar,
  Divider,
  Grid,
  IconButton,
  LoadingButton,
  Tooltip,
  Typography,
  styled,
} from '@rosen-bridge/ui-kit';

import useNetwork from '@/_hooks/useNetwork';
import { useTokensMap } from '@/_hooks/useTokensMap';
import { useTransaction } from '@/_hooks/useTransaction';
import useTransactionFees from '@/_hooks/useTransactionFees';
import useTransactionFormData from '@/_hooks/useTransactionFormData';
import useWallet from '@/_hooks/useWallet';

import { getTokenNameAndId } from '@/_utils';
import { ChooseWalletModal } from './ChooseWalletModal';

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
const BridgeTransaction = () => {
  const [chooseWalletsModalOpen, setChooseWalletsModalOpen] = useState(false);

  const {
    sourceValue,
    targetValue,
    tokenValue,
    amountValue,
    formState: { isSubmitting: isFormSubmitting },
    handleSubmit,
  } = useTransactionFormData();

  const rawTokenMap = useTokensMap();
  const tokenMap = new TokenMap(rawTokenMap);

  const {
    status,
    networkFee,
    bridgeFee,
    receivingAmount,
    isLoading: isLoadingFees,
    minTransfer,
  } = useTransactionFees(sourceValue, targetValue, tokenValue, amountValue);
  const { setSelectedWallet, wallets, selectedWallet } = useWallet();

  const { selectedNetwork } = useNetwork();

  const tokenInfo = tokenValue && getTokenNameAndId(tokenValue, sourceValue);

  const idKey = sourceValue && tokenMap.getIdKey(sourceValue);
  const targetTokenSearchResults =
    tokenValue &&
    idKey &&
    tokenMap.search(sourceValue, {
      [idKey]: tokenValue[idKey],
    });
  const targetTokenInfo = targetTokenSearchResults?.[0]?.[targetValue];

  const WalletIcon = selectedWallet?.icon;
  const { startTransaction, isSubmitting: isTransactionSubmitting } =
    useTransaction();

  const handleFormSubmit = handleSubmit(() => {
    startTransaction(+bridgeFee, +networkFee);
  });

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
            networkFee || 'Pending',
            'primary',
          )}
          {renderFee(
            'Bridge Fee',
            tokenInfo?.tokenName,
            bridgeFee || 'Pending',
            'primary',
          )}
          {renderFee(
            'Min Transfer',
            tokenInfo?.tokenName,
            minTransfer || 'Pending',
            'primary',
          )}
          <Divider />
          {renderFee(
            'You will receive',
            targetTokenInfo?.name,
            receivingAmount,
            'secondary',
          )}
          {status?.status === 'error' && renderAlert()}
        </FeesContainer>

        <Grid item container flexDirection="column">
          <LoadingButton
            sx={{ width: '100%' }}
            color={selectedWallet ? 'success' : 'primary'}
            variant="contained"
            loading={
              isFormSubmitting || isTransactionSubmitting || isLoadingFees
            }
            type="submit"
            disabled={!sourceValue}
            onClick={() => {
              if (!selectedWallet) {
                setChooseWalletsModalOpen(true);
              } else {
                handleFormSubmit();
              }
            }}
          >
            {!selectedWallet ? 'CONNECT WALLET' : 'SUBMIT'}
          </LoadingButton>
        </Grid>
      </Grid>
      <ChooseWalletModal
        open={chooseWalletsModalOpen}
        chainName={selectedNetwork?.name ?? ''}
        setSelectedWallet={setSelectedWallet}
        handleClose={() => setChooseWalletsModalOpen(false)}
        wallets={wallets || []}
      />
    </>
  );
};

export default BridgeTransaction;
