import { HexString, Paging, RawTx } from '../types';

type EncodedTxOut = HexString;
type EncodedBalance = HexString;
type EncodedAddress = HexString;
type EncodedAmount = HexString;
type TxId = HexString;
type RawUnsignedTx = HexString;

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
