import { useContext } from 'react';
import { useController } from 'react-hook-form';

import { getNonDecimalString } from '@rosen-ui/utils';

import useTransactionFormData from './useTransactionFormData';

import { WalletContext } from '@/_contexts/walletContext';

import { validateAddress } from '@/_actions/validateAddress';

import { availableNetworks } from '@/_networks';
import { getMinTransfer } from '@/_utils/index';
import { getMaxTransfer } from '@/_utils/getMaxTransfer';
import { useTokenMap } from './useTokenMap';
import { Network, RosenAmountValue } from '@rosen-ui/types';
import { unwrap } from '@/_errors';
import { cache } from '@/_utils/cache';

/**
 * handles the form field registrations and form state changes
 * and validations
 */

const useBridgeForm = () => {
  const { control, resetField, reset, setValue, formState, setFocus } =
    useTransactionFormData();

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
        // match any complete or incomplete decimal number
        const match = value.match(/^(\d+(\.(?<floatingDigits>\d+))?)?$/);

        // prevent user from entering invalid numbers
        const isValueInvalid = !match;
        if (isValueInvalid) return 'The amount is not valid';

        if (!tokenMap) return 'Token map config is unavailable';
        const decimals =
          tokenMap.getSignificantDecimals(tokenField.value.tokenId) || 0;

        // prevent user from entering more decimals than token decimals
        const isDecimalsLarge =
          (match?.groups?.floatingDigits?.length || 0) > decimals;
        if (isDecimalsLarge)
          return `The current token only supports ${decimals} decimals`;

        const wrappedAmount = BigInt(
          getNonDecimalString(value, decimals),
        ) as RosenAmountValue;

        if (walletGlobalContext?.state.selectedWallet) {
          // prevent user from entering more than token amount

          const selectedNetwork =
            availableNetworks[sourceField.value as Network];

          const maxTransfer = await getMaxTransfer(
            selectedNetwork,
            {
              balance:
                await walletGlobalContext!.state.selectedWallet.getBalance(
                  tokenField.value,
                ),
              isNative: tokenField.value.metaData.type === 'native',
            },
            async () => ({
              fromAddress:
                await walletGlobalContext!.state.selectedWallet!.getAddress(),
              toAddress: addressField.value,
              toChain: targetField.value as Network,
            }),
          );

          const isAmountLarge = wrappedAmount > maxTransfer;
          if (isAmountLarge) return 'Balance insufficient';
        }

        const minTransfer = await getMinTransfer(
          tokenField.value,
          sourceField.value,
          targetField.value,
        );
        const isAmountSmall = wrappedAmount < minTransfer;
        if (isAmountSmall) return 'Minimum transfer amount not respected';

        return undefined;
      },
    },
  });

  const { field: addressField } = useController({
    name: 'walletAddress',
    control,
    rules: {
      validate: async (value) => {
        if (!value) {
          return 'Address cannot be empty';
        }
        try {
          await cache(unwrap(validateAddress), 60 * 60 * 1000)(
            targetField.value as Network,
            availableNetworks[targetField.value as Network].toSafeAddress(
              value,
            ),
          );
        } catch {
          return 'Invalid Address';
        }
      },
    },
  });

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
    formState,
  };
};

export default useBridgeForm;
