import { Wallet } from '@rosen-ui/wallet-api';

import { AvailableNetworks } from '@/_networks';
import { RosenAmountValue } from '@rosen-ui/types';

interface GetMaxTransferParams {
  balance: RosenAmountValue;
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
  // THIS FUNCTION WORKS WITH WRAPPED-VALUE
  getMaxTransfer: (
    props: GetMaxTransferParams & GetMaxTransferParamsExtra,
  ) => Promise<RosenAmountValue>;
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
