'use client';

import {
  Grid,
  Typography,
  Button,
  Divider,
  styled,
} from '@rosen-bridge/ui-kit';

import useTransactionFormData from '@/_hooks/useTransactionFormData';
import useTransactionFees from '@/_hooks/useTransactionFees';

import { getTokenNameAndId } from '@/_utils';

const PriceItem = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
}));

const BridgeTransaction = () => {
  const { sourceValue, tokenValue, amountValue } = useTransactionFormData();

  const { networkFee, bridgeFee, receivingAmount } = useTransactionFees(
    sourceValue,
    tokenValue,
    +amountValue,
  );

  const tokenInfo = tokenValue && getTokenNameAndId(tokenValue);

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
            {' '}
            {amount}{' '}
          </Typography>
          <Typography sx={(theme) => ({ margin: theme.spacing(0, 0.5) })}>
            {' '}
            {unit}{' '}
          </Typography>
        </Grid>
      </PriceItem>
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
          networkFee >= 0
            ? networkFee / Math.pow(10, tokenValue?.decimals)
            : 'Pending',
          'primary',
        )}
        {renderFee(
          'Bridge Fee',
          tokenInfo?.tokenName,
          bridgeFee >= 0
            ? bridgeFee / Math.pow(10, tokenValue?.decimals)
            : 'Pending',
          'primary',
        )}
        <Divider />
        {renderFee(
          'You will receive',
          tokenInfo?.tokenName,
          receivingAmount / Math.pow(10, tokenValue?.decimals),
          'secondary',
        )}
      </Grid>

      <Grid item>
        <Button sx={{ width: '100%' }} color="primary" variant="contained">
          CONNECT WALLET
        </Button>
      </Grid>
    </Grid>
  );
};

export default BridgeTransaction;
