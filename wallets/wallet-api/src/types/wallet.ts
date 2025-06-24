import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { Network as NetworkBase } from '@rosen-network/base';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import {
  AddressRetrievalError,
  BalanceFetchError,
  ConnectionRejectedError,
  UnavailableApiError,
  UnsupportedChainError,
} from './errors';

export interface WalletTransferParams {
  token: RosenChainToken;
  amount: RosenAmountValue;
  fromChain: Network;
  toChain: Network;
  address: string;
  bridgeFee: RosenAmountValue;
  networkFee: RosenAmountValue;
  lockAddress: string;
}

export type WalletConfig = {
  networks: NetworkBase[];
  getTokenMap: () => Promise<TokenMap>;
};

/**
 * main wallet type for the bridge, all wallets implement
 * this interface to unify access and interaction with wallets
 */
export abstract class Wallet<Config extends WalletConfig = WalletConfig> {
  abstract icon: string;
  abstract name: string;
  abstract label: string;
  abstract link: string;
  abstract currentChain: Network;
  abstract supportedChains: Network[];

  constructor(protected config: Config) {}

  abstract performConnect: () => Promise<void>;
  abstract disconnect: () => Promise<void>;
  abstract fetchAddress: () => Promise<string | undefined>;
  abstract fetchBalance: (
    token: RosenChainToken,
  ) => Promise<bigint | number | string | undefined>;
  abstract isAvailable: () => boolean;
  abstract performTransfer: (params: WalletTransferParams) => Promise<string>;
  transfer = async (params: WalletTransferParams): Promise<string> => {
    this.requireAvailable();

    if (this.currentNetwork?.name != this.currentChain) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    return await this.performTransfer(params);
  };

  isConnected: () => Promise<boolean>;
  switchChain?: (chain: Network, silent?: boolean) => Promise<void>;

  get currentNetwork() {
    return this.config.networks.find(
      (network) => network.name == this.currentChain,
    );
  }

  connect = async (): Promise<void> => {
    this.requireAvailable();

    try {
      await this.performConnect();
    } catch (error) {
      throw new ConnectionRejectedError(this.name, error);
    }
  };

  getAddress = async (): Promise<string> => {
    this.requireAvailable();

    try {
      const address = await this.fetchAddress();

      if (!address) throw address;

      return address;
    } catch (error) {
      throw new AddressRetrievalError(this.name, error);
    }
  };

  getBalance = async (token: RosenChainToken): Promise<RosenAmountValue> => {
    this.requireAvailable();

    let raw;

    try {
      raw = await this.fetchBalance(token);
    } catch (error) {
      throw new BalanceFetchError(this.name, error);
    }

    if (!raw) return 0n;

    const amount = BigInt(raw);

    if (!amount) return 0n;

    const tokenMap = await this.config.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token.tokenId,
      amount,
      this.currentChain,
    ).amount;

    return wrappedAmount;
  };

  protected requireAvailable: () => void = () => {
    if (!this.isAvailable()) {
      throw new UnavailableApiError(this.name);
    }
  };
}

///////////////////////////////////

// type WalletManagerConfig = {
//   localStorageKey: string;
//   wallets: Wallet[];
// };

// class WalletManager {
//   selected?: Wallet;

//   constructor(private config: WalletManagerConfig) {}

//   disconnect = async () => {
//     if (!this.selected) return;

//     await this.selected.disconnect();

//     localStorage.removeItem(this.config.localStorageKey + this.selected.name);

//     // TODO: emit changes
//     this.selected = undefined;
//   };

//   filtereByNetwork = (network: Network) => {
//     return this.config.wallets.filter((wallet) => {
//       return wallet.supportedChains.includes(network);
//     });
//   };

//   select = async (wallet: Wallet, network: Network) => {
//     await wallet.connect();

//     await wallet.switchChain?.(network);

//     localStorage.setItem(this.config.localStorageKey + network, wallet.name);

//     // TODO: emit changes
//     this.selected = wallet;
//   };

//   aaa = async (network: Network) => {
//     // TODO: emit changes
//     this.selected = undefined;

//     const name = localStorage.getItem(this.config.localStorageKey + network);

//     if (!name) return;

//     const wallet = Object.values(wallets).find((wallet) => wallet.name == name);

//     if (!wallet || !wallet.isAvailable()) return;

//     if (!(await wallet.isConnected())) return;

//     await wallet.connect();

//     await wallet.switchChain?.(network, true);

//     // TODO: emit changes
//     this.selected = wallet;
//   };
// }

// const wallets = new WalletManager({
//   localStorageKey: 'rosen:wallet:',
//   wallets: [],
// });

// export const WalletProvider = ({ children }: PropsWithChildren) => {
//   const { selectedSource } = useNetwork();

//   const { openSnackbar } = useSnackbar();

//   const [selected, setSelected] = useState<Wallet>();

//   const filtered = useMemo(() => {
//     if (!selectedSource) return [];
//     return wallets.filtereByNetwork(selectedSource.name);
//   }, [selectedSource]);

//   const select = useCallback(
//     async (wallet: Wallet) => {
//       try {
//         await wallets.select(wallet, selectedSource.name);
//         setSelected(wallets.selected);
//       } catch (error: any) {
//         openSnackbar(error.message, 'error');
//       }
//     },
//     [selectedSource, openSnackbar, setSelected],
//   );

//   const disconnect = wallets.disconnect;

//   useEffect(() => {
//     (async () => {
//       try {
//         await wallets.aaa(selectedSource.name);
//         setSelected(wallets.selected);
//       } catch (error) {
//         throw error;
//       }
//     })();
//   }, [selectedSource, setSelected]);

//   /**
//    * TODO: update or move this logic
//    * local:ergo/rosen-bridge/ui#577
//    */
//   useEffect(() => {
//     if (!selected) return;

//     if (!selectedSource) return;

//     if (selectedSource.name !== NETWORKS.bitcoin.key) return;

//     const start = async () => {
//       const address = await selected.getAddress();

//       const isValid = address.toLowerCase().startsWith('bc1q');

//       if (isValid) return;

//       openSnackbar(
//         'The source address of the selected wallet is not native SegWit (P2WPKH or P2WSH).',
//         'error',
//       );
//     };

//     start();
//   }, [selected, selectedSource]);

//   const state = {
//     select,
//     selected,
//     wallets: filtered,
//     disconnect,
//   };

//   return (
//     <WalletContext.Provider value={state}>{children}</WalletContext.Provider>
//   );
// };
