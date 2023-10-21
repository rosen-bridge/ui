import { HexString, Paging, RawTx, TxId } from '../types';

export type EncodedTxOut = HexString;
export type EncodedBalance = HexString;
export type EncodedAddress = HexString;
export type EncodedAmount = HexString;
export type RawUnsignedTx = HexString;

/**
 * carano wallets interface
 */
export interface ConnectorContextApi {
  getUtxos(
    amount?: EncodedAmount,
    paginate?: Paging
  ): Promise<EncodedTxOut[] | undefined>;
  getCollateral(params?: {
    amount?: EncodedAmount;
  }): Promise<EncodedTxOut[] | undefined>;
  experimental: {
    getCollateral(params: {
      amount?: EncodedAmount;
    }): Promise<EncodedTxOut[] | undefined>;
  };
  getChangeAddress(): Promise<EncodedAddress>;
  getBalance(): Promise<EncodedBalance>;
  getUsedAddresses(paginate?: Paging): Promise<EncodedAddress[]>;
  getUnusedAddresses(paginate?: Paging): Promise<EncodedAddress[]>;
  signTx(tx: RawUnsignedTx, partialSign: boolean): Promise<RawTx>;
  getNetworkId(): Promise<number>;
  submitTx(tx: RawTx): Promise<TxId>;
}
