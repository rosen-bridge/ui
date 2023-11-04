'use client';

import {
  Avatar,
  Alert,
  Grid,
  Typography,
  Tooltip,
  Divider,
  styled,
  LoadingButton,
} from '@rosen-bridge/ui-kit';

import useTransactionFormData from '@/_hooks/useTransactionFormData';
import useTransactionFees from '@/_hooks/useTransactionFees';
import useWallet from '@/_hooks/useWallet';
import { useTransaction } from '@/_hooks/useTransaction';

import { getTokenNameAndId } from '@/_utils';

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
  const {
    sourceValue,
    targetValue,
    tokenValue,
    amountValue,
    formState: { isValidating },
    handleSubmit,
  } = useTransactionFormData();

  const {
    status,
    networkFee,
    bridgeFee,
    receivingAmount,
    isLoading: isLoadingFees,
  } = useTransactionFees(sourceValue, tokenValue, amountValue);
  const { setSelectedWallet, availableWallets, selectedWallet } = useWallet();

  const tokenInfo = tokenValue && getTokenNameAndId(tokenValue, sourceValue);
  const WalletIcon = selectedWallet?.icon;
  const { startTransaction } = useTransaction();

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
      <PriceItem sx={(theme) => ({ margin: theme.spacing(1) })}>
        <Typography>Wallet</Typography>
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
          <Divider />
          {renderFee(
            'You will receive',
            tokenInfo?.tokenName,
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
            loading={isValidating}
            disabled={!availableWallets}
            onClick={() => {
              if (!selectedWallet) {
                setSelectedWallet?.(availableWallets?.[0]);
              } else {
                handleFormSubmit();
              }
            }}
          >
            {!selectedWallet ? 'CONNECT WALLET' : 'SUBMIT'}
          </LoadingButton>
        </Grid>
      </Grid>
    </>
  );
};

export default BridgeTransaction;
