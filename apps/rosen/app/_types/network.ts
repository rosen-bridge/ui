import { Wallet, WalletInfo } from '@rosen-ui/wallet-api';

import { Networks } from '@/_constants';

type NetworksType = typeof Networks;

interface GetMaxTransferableAmountsParams {
  balance: number;
  isNative: boolean;
}

/**
 * the main network interface for all supported networks
 */
export interface BaseNetwork<
  NetworkName extends keyof NetworksType,
  GetMaxTransferableAmountsParamsExtra = {},
> {
  name: NetworkName;
  logo: string;
  label: string;
  availableWallets: Wallet[];
  supportedWallets: WalletInfo[];
  nextHeightInterval: number;
  lockAddress: string;
  getMaxTransferableAmount: (
    props: GetMaxTransferableAmountsParams & GetMaxTransferableAmountsParamsExtra,
  ) => Promise<number>;
}

interface BitcoinMaxTransferExtra {
  eventData: {
    toChain: string;
    fromAddress: string;
    toAddress: string;
  };
}

export interface ErgoNetwork extends BaseNetwork<'ergo'> {}
export interface CardanoNetwork extends BaseNetwork<'cardano'> {}
export interface BitcoinNetwork
  extends BaseNetwork<'bitcoin', BitcoinMaxTransferExtra> {}

export type SupportedWallets = Wallet;
