import type { RosenChainToken } from '@rosen-bridge/tokens';
import {
  Address,
  AssetName,
  TxId,
  ErgoBox,
  ErgoTx,
  Prover,
  WalletBase,
} from '../types';

/**
 * ergo token info
 */
export interface ErgoToken extends RosenChainToken {
  tokenId: Address;
  tokenName: AssetName;
  decimals: number;
}

/**
 * main interface the connect and control ergo wallets
 */
export interface ErgoWallet extends WalletBase, Prover {
  readonly getBalance: (token: RosenChainToken) => Promise<string>;
  readonly getUsedAddresses?: () => Address[];
  readonly getUnusedAddresses?: () => Address[];
  readonly getChangeAddress?: () => Address;
  readonly getAddresses?: () => Address[];
  readonly getUtxos?: () => ErgoBox[];
  readonly submitTx?: (tx: ErgoTx) => TxId;
  readonly hidden?: boolean;
  readonly transfer: (
    token: RosenChainToken,
    toChain: string,
    address: Address,
    bridgeFee: number,
    networkFee: number,
    lockAddress: string
  ) => void;
}
