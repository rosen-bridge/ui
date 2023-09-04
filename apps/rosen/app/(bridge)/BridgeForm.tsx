'use client';

import { useMemo } from 'react';
import { TokenMap } from '@rosen-bridge/tokens';

import { Grid, TextField, styled, MenuItem, alpha } from '@rosen-bridge/ui-kit';

import useBridgeForm from '@/_hooks/useBridgeForm';

import { countDecimals, getTokenNameAndId } from '@/_utils';

import tokensMap from '@/_configs/tokensMap-private-test-2.0.0-b3dc2da.json';

const FormInputs = styled(TextField)(({ theme }) => ({
  '& .MuiFilledInput-root': {
    overflow: 'hidden',
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.input,

    transition: theme.transitions.create(['background-color', 'box-shadow']),
    '&:hover': {
      backgroundColor: theme.palette.background.header,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.header,
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
    },
  },
}));

const FormContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

const BridgeForm = () => {
  const {
    reset,
    setValue,
    resetField,
    sourceField,
    targetField,
    tokenField,
    amountField,
    addressField,
    formState: { errors },
  } = useBridgeForm();

  const { tokenMapper, allChains } = useMemo(() => {
    const Mapper = new TokenMap(tokensMap);
    return {
      tokenMapper: Mapper,
      allChains: Mapper.getAllChains(),
    };
  }, []);

  const targetChainOptions = useMemo(() => {
    return tokenMapper.getSupportedChains(sourceField.value);
  }, [sourceField.value, tokenMapper]);

  const tokens = useMemo(() => {
    if (!targetField.value || !sourceField.value) return [];

    return tokenMapper.getTokens(sourceField.value, targetField.value);
  }, [targetField.value, sourceField.value, tokenMapper]);

  return (
    <FormContainer>
      <Grid container spacing={1}>
        <Grid item mobile={6}>
          <FormInputs
            id="source"
            select
            label="Source"
            inputProps={{ 'aria-label': 'Without label' }}
            InputProps={{ disableUnderline: true } as any}
            variant="filled"
            {...sourceField}
            onChange={(e) => {
              if (e.target.value !== sourceField.value) {
                reset({
                  target: null,
                  token: null,
                  amount: '',
                  walletAddress: '',
                  source: e.target.value,
                });
              }
            }}
          >
            {allChains.map((chain) => (
              <MenuItem key={chain} value={chain}>
                {chain}
              </MenuItem>
            ))}
          </FormInputs>
        </Grid>
        <Grid item mobile={6}>
          <FormInputs
            id="target"
            select
            label="Target"
            disabled={!sourceField.value}
            InputProps={{ disableUnderline: true } as any}
            variant="filled"
            {...targetField}
            onChange={(e) => {
              if (e.target.value !== targetField.value) {
                reset({
                  source: sourceField.value,
                  target: e.target.value,
                  token: null,
                  amount: '',
                  walletAddress: '',
                });
              }
            }}
          >
            {targetChainOptions.map((chain) => (
              <MenuItem key={chain} value={chain}>
                {chain}
              </MenuItem>
            ))}
          </FormInputs>
        </Grid>
      </Grid>
      <FormInputs
        id="token"
        select
        label="TOKEN"
        disabled={!tokens.length}
        InputProps={{ disableUnderline: true } as any}
        variant="filled"
        {...tokenField}
        value={
          tokenField.value ? getTokenNameAndId(tokenField.value).tokenId : ''
        }
        onChange={(e) => {
          const currentToken = tokens.find(
            (token) => getTokenNameAndId(token).tokenId === e.target.value,
          );
          setValue('token', currentToken, {
            shouldDirty: true,
            shouldTouch: true,
          });
          setValue('amount', '');
          resetField('amount');
        }}
      >
        {tokens.map((token) => {
          const { tokenId, tokenName } = getTokenNameAndId(token);
          return (
            <MenuItem key={tokenId} value={tokenId}>
              {tokenName}
            </MenuItem>
          );
        })}
      </FormInputs>
      <FormInputs
        type="number"
        id="amount"
        size="medium"
        label="Amount"
        placeholder="0.0"
        InputProps={{ disableUnderline: true } as any}
        inputProps={{
          style: { fontSize: '2rem' },
        }}
        variant="filled"
        {...amountField}
        onChange={(e) => {
          if (countDecimals(e.target.value) <= tokenField.value?.decimals) {
            amountField.onChange(e);
          }
        }}
        disabled={!tokenField.value}
      />
      <FormInputs
        label="Address"
        InputProps={{ disableUnderline: true } as any}
        variant="filled"
        error={!!errors?.walletAddress}
        helperText={errors.walletAddress?.message?.toString()}
        {...addressField}
      />
    </FormContainer>
  );
};

export default BridgeForm;
