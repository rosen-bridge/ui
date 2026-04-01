import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import { RosenAmountValue } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';

import { useBalance } from './useBalance';
import { useNetwork } from './useNetwork';
import { useTokenMap } from './useTokenMap';
import { useWallet } from './useWallet';
import { useBridgeForm } from './useBridgeForm';
import { useBridgeFormValues } from './useBridgeFormValues';

const MaxTransferContext = createContext<MaxTransferContextType | null>(null);

/**
 * a hook version of `getMaxTransfer` util
 */
export const useMaxTransfer = () => {
  const context = useContext(MaxTransferContext);

  if (!context) {
    throw new Error('useMaxTransfer must be used within MaxTransferProvider');
  }

  return context;
};

export type MaxTransferContextType = {
  amount: RosenAmountValue;
  error: unknown;
  isLoading: boolean;
  raw: string;
  load: () => void;
};

export const MaxTransferProvider = ({ children }: PropsWithChildren) => {
  const balance = useBalance();

  const network = useNetwork();

  const tokenMap = useTokenMap();

  const { formState } = useBridgeForm();

  const { target, token, walletAddress } = useBridgeFormValues();

  const wallet = useWallet();

  const [amount, setAmount] = useState<RosenAmountValue>(0n);

  const [error, setError] = useState<unknown>();

  const [isTransitionLoading, startTransition] = useTransition();

  const isLoading = balance.isLoading || isTransitionLoading;

  const raw = useMemo(() => {
    if (!amount || !tokenMap || !token) return '0';
    return getDecimalString(
      amount,
      tokenMap.getSignificantDecimals(token.tokenId),
    );
  }, [amount, tokenMap, token]);

  const load = useCallback(() => {
    setAmount(0n);

    setError(null);

    if (
      !balance.amount ||
      balance.isLoading ||
      !network.selectedSource ||
      !target ||
      !token ||
      !wallet.selected ||
      formState.errors?.walletAddress
    )
      return;

    startTransition(async () => {
      try {
        const amount = await network.selectedSource!.getMaxTransfer({
          balance: balance.amount,
          isNative: token.type === 'native',
          eventData: {
            fromAddress: await wallet.selected!.getAddress(),
            toAddress: walletAddress!,
            toChain: target!,
          },
        });

        setAmount(amount);
      } catch (error) {
        setError(error);
      }
    });
  }, [
    balance.amount,
    balance.isLoading,
    network.selectedSource,
    wallet.selected,
    formState.errors,
    target,
    token,
    walletAddress,
  ]);

  useEffect(load, [load]);

  const state = useMemo<MaxTransferContextType>(
    () => ({
      amount,
      error,
      isLoading,
      raw,
      load,
    }),
    [amount, error, isLoading, raw, load],
  );

  return (
    <MaxTransferContext.Provider value={state}>
      {children}
    </MaxTransferContext.Provider>
  );
};
