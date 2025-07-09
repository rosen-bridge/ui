import { useContext } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { RosenChainToken } from '@rosen-bridge/tokens';
import {
  InputSelectNetworkProps,
  InputSelectProps,
  InputTextProps,
} from '@rosen-bridge/ui-kit';
import { Network } from '@rosen-network/base';
import { RosenAmountValue } from '@rosen-ui/types';
import { getNonDecimalString } from '@rosen-ui/utils';

import { BridgeForm } from '@/(bridge)/page';
import { validateAddress } from '@/_actions';
import { useNetwork } from '@/_hooks';
import * as networks from '@/_networks';
import { unwrap } from '@/_safeServerAction';
import { getMinTransfer } from '@/_utils';

import { useTokenMap } from './useTokenMap';
import { WalletContext } from './useWallet';

/**
 * handles the form field registrations and form state changes
 * and validations
 */

export const useBridgeForm = () => {
  const { control, formState, watch, setValue, resetField } =
    useFormContext<BridgeForm>();

  const { availableTokens, availableSources, availableTargets } = useNetwork();
  const tokenMap = useTokenMap();

  const walletGlobalContext = useContext(WalletContext);

  const { field: amountField } = useController({
    name: 'amount',
    control,
    rules: {
      validate: async (value) => {
        const { source, target, token, walletAddress } = watch();

        // check prerequisites
        if (value == null) return 'Please enter amount';
        if (!source) return 'Please select the source network';
        if (!target) return 'Please select the target network';
        if (!token) return 'Please select a token';
        if (!walletAddress) return 'Please enter the target address';

        // match any complete or incomplete decimal number
        const match = value.match(/^(\d+(\.(?<floatingDigits>\d+))?)?$/);

        // prevent user from entering invalid numbers
        const isValueInvalid = !match;
        if (isValueInvalid) return 'The amount is not valid';

        if (!tokenMap) return 'Token map config is unavailable';
        const decimals = tokenMap.getSignificantDecimals(token?.tokenId) || 0;

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
            (wallet) => wallet.name == source?.name,
          )!;

          const maxTransfer = await selectedNetwork.getMaxTransfer({
            balance: await walletGlobalContext!.selected.getBalance(token),
            isNative: token?.type === 'native',
            eventData: {
              fromAddress: await walletGlobalContext!.selected!.getAddress(),
              toAddress: walletAddress,
              toChain: target.name,
            },
          });

          const isAmountLarge = wrappedAmount > maxTransfer;
          if (isAmountLarge) return 'Balance insufficient';
        }

        const minTransfer = await getMinTransfer(
          token,
          source.name,
          target.name,
        );
        const isAmountSmall = wrappedAmount < minTransfer;
        if (isAmountSmall) return 'Minimum transfer amount not respected';

        return undefined;
      },
    },
  });

  const fields: {
    source: InputSelectNetworkProps<Network>;
    target: InputSelectNetworkProps<Network>;
    token: InputSelectProps<RosenChainToken>;
    address: InputTextProps;
  } = {
    source: {
      name: 'source',
      label: 'Source',
      defaultValue: null,
      options: availableSources,
      required: true,
      onValueChange: () => {
        resetField('target');
        resetField('token');
        resetField('amount');
      },
    },
    target: {
      name: 'target',
      label: 'Target',
      defaultValue: null,
      options: availableTargets,
      required: true,
      disabled: !watch('source'),
      onValueChange: () => {
        resetField('token');
        resetField('amount');
      },
    },
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
          targetNetwork.name,
          Object.values(networks)
            .find((wallet) => wallet.name == targetNetwork.name)!
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
    setValue,
    amountField,
    formState,
    formValues: watch(),
  };
};
