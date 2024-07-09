import { Wallet } from '@rosen-ui/wallet-api';

import { AvailableNetworks } from '@/_networks';

interface GetMaxTransferParams {
  balance: number;
  isNative: boolean;
}

/**
 * the main network interface for all supported networks
 */
export interface BaseNetwork<
  NetworkName extends AvailableNetworks,
  GetMaxTransferParamsExtra = {},
> {
  name: NetworkName;
  logo: string;
  label: string;
  wallets: Wallet[];
  nextHeightInterval: number;
  lockAddress: string;
  getMaxTransfer: (
    props: GetMaxTransferParams & GetMaxTransferParamsExtra,
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
