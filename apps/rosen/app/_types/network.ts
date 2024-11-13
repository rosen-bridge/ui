import { Network, RosenAmountValue } from '@rosen-ui/types';
import { Wallet } from '@rosen-ui/wallet-api';

interface GetMaxTransferParams {
  balance: RosenAmountValue;
  isNative: boolean;
}

/**
 * the main network interface for all supported networks
 */
export interface BaseNetwork<
  NetworkName extends Network,
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
  toSafeAddress: (address: string) => string;
}

interface BitcoinMaxTransferExtra {
  eventData: {
    toChain: Network;
    fromAddress: string;
    toAddress: string;
  };
}

export interface EthereumNetwork extends BaseNetwork<'ethereum'> {}
export interface ErgoNetwork extends BaseNetwork<'ergo'> {}
export interface CardanoNetwork extends BaseNetwork<'cardano'> {}
export interface BitcoinNetwork
  extends BaseNetwork<'bitcoin', BitcoinMaxTransferExtra> {}
