import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useController, useFormContext } from 'react-hook-form';

import type { Network, RosenAmountValue } from '@rosen-ui/types';
import { getNonDecimalString } from '@rosen-ui/utils';

import networks from '@/networks';

import { FEE_CONFIG_TOKEN_ID } from '../../configs';
import { useTokenMap } from './useTokenMap';
import { useTransactionFormData } from './useTransactionFormData';
import { WalletContext } from './useWallet';

const useDebouncedValidation = (name: string, resetDeps: unknown[]) => {
  const { setValue, setError, trigger } = useFormContext();

  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const [isValidating, setIsValidating] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: cancel pending validation when these change
  useEffect(() => () => clearTimeout(timeout.current), resetDeps);

  const handleChange = useCallback(
    (value: string, immediate = false) => {
      setValue(name, value.trim(), { shouldDirty: true, shouldTouch: true });
      setError(name, { type: 'pending' });
      clearTimeout(timeout.current);
      const current = setTimeout(
        async () => {
          setIsValidating(true);
          queue.current = queue.current.then(async () => {
            if (timeout.current !== current) return;
            await trigger(name);
            if (timeout.current !== current) setError(name, { type: 'pending' });
          });
          await Promise.all([queue.current, new Promise((resolve) => setTimeout(resolve, 500))]);
          if (timeout.current === current) setIsValidating(false);
        },
        immediate ? 0 : 1250,
      );
      timeout.current = current;
    },
    [name, setValue, setError, trigger],
  );

  return { isValidating, handleChange };
};

/**
 * handles the form field registrations and form state changes
 * and validations
 */

export const useBridgeForm = () => {
  const { control, resetField, reset, setValue, formState, setFocus } = useTransactionFormData();

  const tokenMap = useTokenMap();

  const walletGlobalContext = useContext(WalletContext);

  const { field: sourceField } = useController({
    name: 'source',
    control,
  });

  const { field: targetField } = useController({
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
    rules: {
      validate: async (value) => {
        try {
          // match any complete or incomplete decimal number
          const match = value.match(/^(\d+(\.(?<floatingDigits>\d+))?)?$/);

          // prevent user from entering invalid numbers
          const isValueInvalid = !match;
          if (isValueInvalid) return 'The amount is not valid';

          if (!tokenMap) return 'Token map config is unavailable';
          const decimals = tokenMap.getSignificantDecimals(tokenField.value.tokenId) || 0;

          // prevent user from entering more decimals than token decimals
          const isDecimalsLarge = (match?.groups?.floatingDigits?.length || 0) > decimals;
          if (isDecimalsLarge) return `The current token only supports ${decimals} decimals`;

          const wrappedAmount = BigInt(getNonDecimalString(value, decimals)) as RosenAmountValue;

          if (walletGlobalContext?.selected) {
            // prevent user from entering more than token amount

            const selectedNetwork = Object.values(networks).find(
              (wallet) => wallet.name === sourceField.value,
            );

            if (!selectedNetwork) return 'Could not find the selected source network';

            const maxTransfer = await selectedNetwork.getMaxTransfer({
              balance: await walletGlobalContext.selected.getBalance(tokenField.value),
              isNative: tokenField.value.type === 'native',
              eventData: {
                fromAddress: await walletGlobalContext.selected.getAddress(),
                toAddress: addressField.value,
                toChain: targetField.value as Network,
              },
            });

            const isAmountLarge = wrappedAmount > maxTransfer;
            if (isAmountLarge) return 'Balance insufficient';
          }

          const network = Object.values(networks).find(
            (network) => network.name === sourceField.value,
          )!;

          const minTransfer = await network.getMinTransfer(
            tokenField.value,
            targetField.value,
            FEE_CONFIG_TOKEN_ID,
          );
          const isAmountSmall = wrappedAmount < minTransfer;
          if (isAmountSmall) return 'Minimum transfer amount not respected';

          return undefined;
        } catch {
          return 'Something went wrong! please try again';
        }
      },
    },
  });

  const { field: addressField } = useController({
    name: 'walletAddress',
    control,
    rules: {
      validate: async (value) => {
        try {
          if (!value) {
            return 'Address cannot be empty';
          }

          const network = Object.values(networks).find(
            (wallet) => wallet.name === targetField.value,
          );

          if (!network) return;

          const isValid = await network.validateAddress(network.toSafeAddress(value));

          if (isValid) return;

          return 'Invalid Address';
        } catch {
          return 'Something went wrong! please try again';
        }
      },
    },
  });

  const { handleChange: handleAddressChange, isValidating: isAddressValidating } =
    useDebouncedValidation('walletAddress', [targetField.value]);

  const { handleChange: handleAmountChange, isValidating: isAmountValidating } =
    useDebouncedValidation('amount', [targetField.value, tokenField.value]);

  return {
    reset,
    setValue,
    resetField,
    setFocus,
    sourceField,
    targetField,
    tokenField,
    amountField,
    addressField,
    isAddressValidating,
    handleAddressChange,
    isAmountValidating,
    handleAmountChange,
    formState,
  };
};
