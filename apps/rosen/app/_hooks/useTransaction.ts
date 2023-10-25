import { RosenChainToken } from '@rosen-bridge/tokens';

import useLockAddress from './useLockAddress';
import useTransactionFormData from './useTransactionFormData';
import useWallet from './useWallet';

/**
 * a react hook to create and sign and submit transactions
 */
export const useTransaction = () => {
  // all form values can be accessed here and they update when something changes
  const { targetValue, tokenValue, amountValue, walletAddressValue } =
    useTransactionFormData();

  const { selectedWallet } = useWallet();

  // source chain height updates when the chain changes
  const lockAddress = useLockAddress();

  // this is just a simple demonstration you can use wsr or anything else
  // in this hook if needed
  // it is recommended to have all non general wallet specific logic in here

  const startTransaction = (bridgeFee: number, networkFee: number) => {
    if (
      tokenValue &&
      targetValue &&
      amountValue &&
      walletAddressValue &&
      bridgeFee &&
      networkFee
    ) {
      selectedWallet?.transfer(
        tokenValue as RosenChainToken,
        amountValue,
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
