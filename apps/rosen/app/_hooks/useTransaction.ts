import { RosenChainToken } from '@rosen-bridge/tokens';
import { useSnackbar } from '@rosen-bridge/ui-kit';

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

  const { openSnackbar } = useSnackbar();

  // this is just a simple demonstration you can use wsr or anything else
  // in this hook if needed
  // it is recommended to have all non general wallet specific logic in here

  const startTransaction = async (bridgeFee: number, networkFee: number) => {
    if (
      tokenValue &&
      targetValue &&
      amountValue &&
      walletAddressValue &&
      bridgeFee &&
      networkFee
    ) {
      const txId = await selectedWallet?.transfer(
        tokenValue as RosenChainToken,
        amountValue,
        targetValue,
        walletAddressValue,
        bridgeFee,
        networkFee,
        lockAddress,
      );
      openSnackbar(`Transaction submitted with id [${txId}]`, 'success');
    }
  };

  return {
    startTransaction,
  };
};
