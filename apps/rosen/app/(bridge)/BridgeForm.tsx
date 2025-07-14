'use client';

import { useCallback } from 'react';

import {
  Grid,
  Alert,
  InputSelect,
  InputText,
  InputSelectNetwork,
  InputNumber,
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
    formValues: { source, target, token },
  } = useBridgeForm();

  const { isLoading, raw: balanceRaw } = useBalance();

  const { error, isLoading: isMaxLoading, raw, load } = useMaxTransfer();

  const { selected: selectedWallet } = useWallet();

  const handleSelectMax = useCallback(() => {
    setValue('amount', Number(raw), {
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
      <InputNumber
        {...fields.amount}
        endAdornment={
          token?.tokenId &&
          selectedWallet && (
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
          )
        }
      />
    </>
  );
};
