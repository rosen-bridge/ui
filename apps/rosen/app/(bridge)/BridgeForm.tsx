'use client';

import { useCallback, ChangeEvent } from 'react';

import {
  Grid,
  TextField,
  Alert,
  InputSelect,
  InputText,
  InputSelectNetwork,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';

import { useBalance, useBridgeForm, useMaxTransfer, useWallet } from '@/_hooks';
import { getTokenNameAndId } from '@/_utils';

import { UseAllAmount } from './UseAllAmount';

/**
 * renders the bridge main form
 */
export const BridgeForm = () => {
  const {
    fields,
    setValue,
    amountField,
    formState: { errors },
    formValues: { source, target, token },
  } = useBridgeForm();

  const { isLoading, raw: balanceRaw } = useBalance();

  const { error, isLoading: isMaxLoading, raw, load } = useMaxTransfer();

  const { selected: selectedWallet } = useWallet();

  const handleAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      amountField.onChange(event);
    },
    [amountField],
  );

  const handleSelectMax = useCallback(() => {
    setValue('amount', raw, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [raw, setValue]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item mobile={12} tablet={6}>
          <InputSelectNetwork {...fields.source} />
        </Grid>
        <Grid item mobile={12} tablet={6}>
          <InputSelectNetwork {...fields.target} />
        </Grid>
      </Grid>
      <InputText {...fields.address} />
      {target?.name == NETWORKS.bitcoin.key && (
        <Alert severity="warning">
          Only Native SegWit (P2WPKH or P2WSH) addresses are supported.
        </Alert>
      )}
      <InputSelect {...fields.token} />
      <TextField
        id="amount"
        size="medium"
        label="Amount"
        placeholder="0.0"
        error={!!errors?.amount}
        helperText={errors.amount?.message?.toString()}
        InputProps={{
          disableUnderline: true,
          endAdornment: token?.tokenId && selectedWallet && (
            <UseAllAmount
              error={!!error}
              loading={isLoading || isMaxLoading}
              value={balanceRaw}
              unit={
                (token && source && getTokenNameAndId(token, source.name))
                  ?.tokenName || ''
              }
              onClick={handleSelectMax}
              onRetry={load}
            />
          ),
        }}
        inputProps={{
          'style': { fontSize: '2rem' },
          'aria-label': 'amount input',
        }}
        variant="filled"
        {...amountField}
        value={amountField.value ?? ''}
        onChange={handleAmountChange}
        disabled={!token}
        autoComplete="off"
      />
    </>
  );
};
