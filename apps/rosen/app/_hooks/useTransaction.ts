import useWallet from './useWallet';
import useChainHeight from './useChainHeight';
import useTransactionFormData from './useTransactionFormData';

// cardano server actions for server side decoding
import {
  decodeWasmValue,
  decodeWasmAddress,
  decodeWasmUtxos,
} from '../_actions/cardanoDecoder';

import { RosenChainToken } from '@rosen-bridge/tokens';

/**
 * a react hook to create and sign and submit transactions
 */
export const useTransaction = () => {
  // all form values can be accessed here and they update when something changes
  const {
    sourceValue,
    targetValue,
    tokenValue,
    amountValue,
    walletAddressValue,
    formState: { isValidating },
  } = useTransactionFormData();

  const { selectedWallet } = useWallet();

  // source chain height updates when the chain changes
  const { height, isLoading: isLoadingHeights } = useChainHeight();
  const lockAddress = ' ';

  // this is just a simple demonstration you can use wsr or anything else
  // in this hook if needed
  // it is recommended to have all non general wallet specific logic in here

  const startTransaction = (bridgeFee: number, networkFee: number) => {
    if (
      tokenValue &&
      targetValue &&
      walletAddressValue &&
      bridgeFee &&
      networkFee
    ) {
      selectedWallet?.transfer(
        tokenValue as RosenChainToken,
        targetValue,
        walletAddressValue,
        bridgeFee,
        networkFee,
        lockAddress,
      );
    }
  };

  return {
    startTransaction,
  };
};
