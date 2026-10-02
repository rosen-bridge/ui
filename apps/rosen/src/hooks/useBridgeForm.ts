import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useController, useFormContext } from 'react-hook-form';

import type { Network, RosenAmountValue } from '@rosen-ui/types';
import { getNonDecimalString } from '@rosen-ui/utils';

import networks from '@/networks';

import { FEE_CONFIG_TOKEN_ID } from '../../configs';
import { useTokenMap } from './useTokenMap';
import { useTransactionFormData } from './useTransactionFormData';
import { WalletContext } from './useWallet';

/** Queue field validation while keeping pending work owned by its current context. */
const useDebouncedValidation = (name: string, resetDeps: unknown[]) => {
  const { setValue, setError, trigger } = useFormContext();

  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const [isValidating, setIsValidating] = useState(false);

  useEffect(
    () => {
      setIsValidating(false);
      return () => {
        clearTimeout(timeout.current);
        timeout.current = undefined;
      };
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: cancel pending validation when these change
    resetDeps,
  );

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
            if (timeout.current !== current && timeout.current !== undefined)
              setError(name, { type: 'pending' });
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
  const {
    control,
    resetField,
    reset: resetForm,
    setValue,
    formState,
    setFocus,
    getValues,
  } = useTransactionFormData();

  const tokenMap = useTokenMap();

  const walletGlobalContext = useContext(WalletContext);

  const selectedWallet = useRef(walletGlobalContext?.selected);
  selectedWallet.current = walletGlobalContext?.selected;
  const mounted = useRef(true);
  const amountRevision = useRef(0);
  const addressRevision = useRef(0);

  /** Revoke validators when their owning form leaves the mounted tree. */
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      amountRevision.current++;
      addressRevision.current++;
    };
  }, []);

  /** Revoke previous responses even when a reset restores the same field values. */
  const reset = useCallback(
    (...args: Parameters<typeof resetForm>) => {
      amountRevision.current++;
      addressRevision.current++;
      return resetForm(...args);
    },
    [resetForm],
  );

  /** Capture the fields and wallet used to decide the current validation. */
  const captureContext = () => {
    const { source, target, token, amount, walletAddress } = getValues();
    return {
      source,
      target,
      token: token && { ...token },
      tokenIdentity: token,
      amount,
      walletAddress,
      wallet: selectedWallet.current,
      amountRevision: amountRevision.current,
      addressRevision: addressRevision.current,
    };
  };

  /** Discard replies when a relevant form field or wallet has changed. */
  const isCurrentContext = (
    context: ReturnType<typeof captureContext>,
    field: 'amount' | 'walletAddress',
  ) => {
    if (!mounted.current) return false;
    const current = captureContext();
    if (context.target !== current.target || context.walletAddress !== current.walletAddress)
      return false;
    return field === 'walletAddress'
      ? context.addressRevision === current.addressRevision
      : context.amountRevision === current.amountRevision &&
          context.source === current.source &&
          context.tokenIdentity === current.tokenIdentity &&
          context.token?.tokenId === current.token?.tokenId &&
          context.token?.type === current.token?.type &&
          context.token?.decimals === current.token?.decimals &&
          context.amount === current.amount &&
          context.wallet === current.wallet;
  };

  /** Clear reset fields and require a fresh validation for a changed, populated field. */
  const cancelledValidation = (field: 'amount' | 'walletAddress') => {
    const current = captureContext();
    if (
      !mounted.current ||
      !current[field] ||
      !current.target ||
      (field === 'amount' && (!current.source || !current.token))
    )
      return undefined;
    return 'Please check this field again.';
  };

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
        const context = captureContext();
        try {
          // match any complete or incomplete decimal number
          const match = value.match(/^(\d+(\.(?<floatingDigits>\d+))?)?$/);

          // prevent user from entering invalid numbers
          const isValueInvalid = !match;
          if (isValueInvalid) return 'The amount is not valid';

          if (!tokenMap) return 'Token map config is unavailable';
          const decimals = tokenMap.getSignificantDecimals(context.token.tokenId) || 0;

          // prevent user from entering more decimals than token decimals
          const isDecimalsLarge = (match?.groups?.floatingDigits?.length || 0) > decimals;
          if (isDecimalsLarge) return `The current token only supports ${decimals} decimals`;

          const wrappedAmount = BigInt(getNonDecimalString(value, decimals)) as RosenAmountValue;

          if (context.wallet) {
            // prevent user from entering more than token amount

            const selectedNetwork = Object.values(networks).find(
              (wallet) => wallet.name === context.source,
            );

            if (!selectedNetwork) return 'Could not find the selected source network';

            const balance = await context.wallet.getBalance(context.token);
            if (!isCurrentContext(context, 'amount')) return cancelledValidation('amount');
            const fromAddress = await context.wallet.getAddress();
            if (!isCurrentContext(context, 'amount')) return cancelledValidation('amount');
            const maxTransfer = await selectedNetwork.getMaxTransfer({
              balance,
              isNative: context.token.type === 'native',
              eventData: {
                fromAddress,
                toAddress: context.walletAddress,
                toChain: context.target as Network,
              },
            });
            if (!isCurrentContext(context, 'amount')) return cancelledValidation('amount');

            const isAmountLarge = wrappedAmount > maxTransfer;
            if (isAmountLarge) return 'Balance insufficient';
          }

          const network = Object.values(networks).find(
            (network) => network.name === context.source,
          )!;

          const minTransfer = await network.getMinTransfer(
            context.token,
            context.target,
            FEE_CONFIG_TOKEN_ID,
          );
          if (!isCurrentContext(context, 'amount')) return cancelledValidation('amount');
          const isAmountSmall = wrappedAmount < minTransfer;
          if (isAmountSmall) return 'Minimum transfer amount not respected';

          return undefined;
        } catch {
          if (!isCurrentContext(context, 'amount')) return cancelledValidation('amount');
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
        const context = captureContext();
        try {
          if (!value) {
            return 'Address cannot be empty';
          }

          const network = Object.values(networks).find((wallet) => wallet.name === context.target);

          if (!network) return;

          const isValid = await network.validateAddress(network.toSafeAddress(value));
          if (!isCurrentContext(context, 'walletAddress'))
            return cancelledValidation('walletAddress');

          if (isValid) return;

          return 'Invalid Address';
        } catch {
          if (!isCurrentContext(context, 'walletAddress'))
            return cancelledValidation('walletAddress');
          return 'Something went wrong! please try again';
        }
      },
    },
  });

  const { handleChange: changeAddress, isValidating: isAddressValidating } = useDebouncedValidation(
    'walletAddress',
    [targetField.value],
  );

  const { handleChange: changeAmount, isValidating: isAmountValidating } = useDebouncedValidation(
    'amount',
    [
      sourceField.value,
      targetField.value,
      tokenField.value,
      addressField.value,
      walletGlobalContext?.selected,
    ],
  );

  /** Keep address and amount replies owned by the latest recipient input. */
  const handleAddressChange = useCallback(
    (value: string, immediate = false) => {
      addressRevision.current++;
      amountRevision.current++;
      changeAddress(value, immediate);
    },
    [changeAddress],
  );

  /** Keep balance and fee replies owned by the latest amount input. */
  const handleAmountChange = useCallback(
    (value: string, immediate = false) => {
      amountRevision.current++;
      changeAmount(value, immediate);
    },
    [changeAmount],
  );

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
