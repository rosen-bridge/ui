import { Network, RosenAmountValue } from '@rosen-ui/types';

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

export interface BinanceNetwork extends BaseNetwork<'binance'> {}
export interface EthereumNetwork extends BaseNetwork<'ethereum'> {}
export interface ErgoNetwork extends BaseNetwork<'ergo'> {}
export interface CardanoNetwork extends BaseNetwork<'cardano'> {}
export interface BitcoinNetwork
  extends BaseNetwork<'bitcoin', BitcoinMaxTransferExtra> {}
