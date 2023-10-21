import { useReducer, createContext } from 'react';

import { SupportedWallets } from '@/_types/network';

type Action =
  | {
      type: 'set';
      wallet: SupportedWallets;
    }
  | { type: 'remove' };
type Dispatch = (action: Action) => void;

type State = { selectedWallet: SupportedWallets | null };

/**
 * a context to make wallet state available to all the
 * program
 */
export const WalletContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function walletReducer(state: State, action: Action) {
  switch (action.type) {
    case 'set': {
      return {
        selectedWallet: action.wallet,
      };
    }
    case 'remove': {
      return {
        selectedWallet: null,
      };
    }
    default: {
      throw new Error(`Unhandled action type`);
    }
  }
}

type WalletContextProviderProps = { children: React.ReactNode };

/**
 * the context provider for the wallet state
 */

function WalletContextProvider({ children }: WalletContextProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, {
    selectedWallet: null,
  });
  const value = { state, dispatch };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export { WalletContextProvider };
