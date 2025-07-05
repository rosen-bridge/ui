import { useContext } from 'react';
import { useController } from 'react-hook-form';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { InputSelectProps, InputTextProps } from '@rosen-bridge/ui-kit';
import { Network, RosenAmountValue } from '@rosen-ui/types';
import { getNonDecimalString } from '@rosen-ui/utils';

import { validateAddress } from '@/_actions';
import { useNetwork } from '@/_hooks';
import * as networks from '@/_networks';
import { unwrap } from '@/_safeServerAction';
import { getMinTransfer } from '@/_utils';

import { useTokenMap } from './useTokenMap';
import { useTransactionFormData } from './useTransactionFormData';
import { WalletContext } from './useWallet';

/**
 * handles the form field registrations and form state changes
 * and validations
 */

export const useBridgeForm = () => {
  const { control, resetField, reset, setValue, formState, setFocus, watch } =
    useTransactionFormData();
  const { availableTokens } = useNetwork();
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
        const address = watch('walletAddress');
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

        if (walletGlobalContext?.selected) {
          // prevent user from entering more than token amount

          const selectedNetwork = Object.values(networks).find(
            (wallet) => wallet.name == sourceField.value,
          )!;

          const maxTransfer = await selectedNetwork.getMaxTransfer({
            balance: await walletGlobalContext!.selected.getBalance(
              tokenField.value,
            ),
            isNative: tokenField.value.type === 'native',
            eventData: {
              fromAddress: await walletGlobalContext!.selected!.getAddress(),
              toAddress: address,
              toChain: targetField.value as Network,
            },
          });

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

  const fields: {
    token: InputSelectProps<RosenChainToken>;
    address: InputTextProps;
  } = {
    token: {
      name: 'token',
      label: 'Token',
      defaultValue: null,
      options: availableTokens,
      optionKey: 'tokenId',
      optionLabel: 'name',
      disableClearable: true,
      required: true,
      disabled: !watch('target'),
      onValueChange: () => resetField('amount'),
    },
    address: {
      name: 'walletAddress',
      label: 'Target Address',
      defaultValue: '',
      enablePasteButton: true,
      required: true,
      validate: async (value) => {
        const targetNetwork = watch('target');
        if (!targetNetwork) {
          return 'Target network is not selected!';
        }
        const isValid = await unwrap(validateAddress)(
          targetNetwork,
          Object.values(networks)
            .find((wallet) => wallet.name == targetNetwork)!
            .toSafeAddress(value),
        );
        if (isValid) return;
        return 'Target address is invalid!';
      },
      onValueChange: (value) => value.trim(),
    },
  };

  return {
    fields,
    reset,
    setValue,
    resetField,
    setFocus,
    sourceField,
    targetField,
    tokenField,
    amountField,
    formState,
  };
};
