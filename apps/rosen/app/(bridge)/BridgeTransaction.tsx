'use client';

import {
  Avatar,
  Grid,
  Typography,
  Divider,
  styled,
  LoadingButton,
} from '@rosen-bridge/ui-kit';

import useTransactionFormData from '@/_hooks/useTransactionFormData';
import useTransactionFees from '@/_hooks/useTransactionFees';
import useWallet from '@/_hooks/useWallet';

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
 * shows fees to the user and handles wallet transaction
 * and wallet connection
 */
const BridgeTransaction = () => {
  const {
    sourceValue,
    tokenValue,
    amountValue,
    formState: { isValidating },
    handleSubmit,
  } = useTransactionFormData();

  const {
    networkFee,
    bridgeFee,
    receivingAmount,
    isLoading: isLoadingFees,
  } = useTransactionFees(sourceValue, tokenValue, amountValue);
  const { setSelectedWallet, availableWallets, selectedWallet } = useWallet();

  const tokenInfo =
    tokenValue && getTokenNameAndId(tokenValue, sourceValue.value);
  const WalletIcon = selectedWallet?.icon;

  const handleFormSubmit = handleSubmit(() => {
    //TODO: add create and handle transaction logic
    // https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/90
  });

  const renderFee = (
    title: string,
    unit: string,
    amount: number | string,
    color: string,
  ) => {
    return (
      <PriceItem sx={(theme) => ({ padding: theme.spacing(1.25, 0.5) })}>
        <Typography variant="h5"> {title} </Typography>

        <Grid container flexWrap="nowrap">
          <Typography color={color} fontWeight="bold">
            {isLoadingFees ? 'Pending...' : amount}
          </Typography>
          <Typography sx={(theme) => ({ margin: theme.spacing(0, 0.5) })}>
            {unit}
          </Typography>
        </Grid>
      </PriceItem>
    );
  };

  const renderWalletInfo = () => {
    if (!WalletIcon) return null;
    return (
      <Grid
        sx={(theme) => ({ margin: theme.spacing(1) })}
        container
        alignItems="center"
        gap={1}
      >
        <Avatar
          sx={{
            width: 18,
            height: 18,
            background: 'transparent',
          }}
        >
          <WalletIcon />
        </Avatar>
        <Typography>{selectedWallet.name}</Typography>
      </Grid>
    );
  };

  return (
    <Grid
      container
      direction="column"
      justifyContent="space-between"
      flexWrap="nowrap"
    >
      <Grid
        item
        container
        direction="column"
        justifyContent="flex-end"
        sx={(theme) => ({ height: '100%', padding: theme.spacing(2, 0) })}
      >
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
      </Grid>

      <Grid item>
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
          {!selectedWallet ? 'CONNECT WALLET' : 'START TRANSACTION'}
        </LoadingButton>
        {renderWalletInfo()}
      </Grid>
    </Grid>
  );
};

export default BridgeTransaction;
