'use client';

import { useMemo, useEffect } from 'react';
import { TokenMap } from '@rosen-bridge/tokens';

import { useForm, useController, FormProvider } from 'react-hook-form';

import {
  Card,
  Divider,
  Grid,
  TextField,
  styled,
  MenuItem,
  alpha,
} from '@rosen-bridge/ui-kit';

import BridgeTransaction from './BridgeTransaction';
import useTransactionFormData from '@/_hooks/useTransactionFormData';

import { getTokenNameAndId } from '@/_utils';

import tokensMap from '@/_constants/tokensMap-private-test-2.0.0-b3dc2da.json';

const BridgeContainer = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '3fr auto 2fr',
  minWidth: 0,
  gap: '10px',
  padding: theme.spacing(3),

  [theme.breakpoints.up('tablet')]: {
    maxWidth: '45%',
  },
}));

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

const countDecimals = (decimalString: string | null) => {
  if (!decimalString) return 0;
  return decimalString.split('.')[1]?.length || 0;
};
interface BridgeForm {
  source: string | null;
  target: string | null;
  token: string | null;
  walletAddress: string | null;
  amount: number | null;
}

const BridgeForm = () => {
  const {
    control,
    resetField,
    setValue,
    sourceValue,
    targetValue,
    tokenValue,
    amountValue,
  } = useTransactionFormData();

  const { field: sourceFiled } = useController({
    name: 'source',
    control,
  });

  const { field: targetFiled } = useController({
    name: 'target',
    control,
  });

  const { field: tokenField } = useController({
    name: 'token',
    control,
  });

  const { field: amountField } = useController({
    name: 'amount',
    control,
  });

  const { field: addressField } = useController({
    name: 'walletAddress',
    control,
  });

  const { tokenMapper, allChains } = useMemo(() => {
    const Mapper = new TokenMap(tokensMap);
    return {
      tokenMapper: Mapper,
      allChains: Mapper.getAllChains(),
    };
  }, []);

  const targetChainOptions = useMemo(() => {
    if (!sourceValue) return [];
    resetField('target');
    setValue('target', null);

    return tokenMapper.getSupportedChains(sourceValue);
  }, [sourceValue, resetField, setValue, tokenMapper]);

  const tokens = useMemo(() => {
    if (!targetValue || !sourceValue) return [];

    return tokenMapper.getTokens(sourceValue, targetValue);
  }, [targetValue, sourceValue, tokenMapper]);

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
            {...sourceFiled}
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
            disabled={!sourceValue}
            InputProps={{ disableUnderline: true } as any}
            variant="filled"
            {...targetFiled}
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
        value={tokenValue ? getTokenNameAndId(tokenValue).tokenId : null}
        onChange={(e) => {
          const currentToken = tokens.find(
            (token) => getTokenNameAndId(token).tokenId === e.target.value,
          );
          setValue('token', currentToken, {
            shouldDirty: true,
            shouldTouch: true,
          });
          setValue('amount', null, { shouldDirty: true, shouldTouch: true });
          // resetField('amount');
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
        value={amountValue}
        onChange={(e) => {
          if (countDecimals(e.target.value) <= tokenValue?.decimals) {
            amountField.onChange(e);
          }
        }}
        disabled={!tokenValue}
      />
      <FormInputs
        label="Address"
        InputProps={{ disableUnderline: true } as any}
        variant="filled"
        {...addressField}
      />
    </FormContainer>
  );
};

const RosenBridge = () => {
  const methods = useForm<BridgeForm>({
    mode: 'onBlur',
    defaultValues: {
      source: null,
      target: null,
      token: null,
      walletAddress: null,
      amount: null,
    },
  });

  return (
    <FormProvider {...methods}>
      <BridgeContainer>
        <BridgeForm />
        <Divider orientation="vertical" flexItem />
        <BridgeTransaction />
      </BridgeContainer>
    </FormProvider>
  );
};

export default RosenBridge;
