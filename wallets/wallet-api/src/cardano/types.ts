import {
  Bech32String,
  HexString,
  AssetName,
  PolicyId,
  Hash32,
  TxHash,
  Paging,
  RawTx,
  TxId,
} from '../types';

export type CardanoWasm =
  typeof import('@emurgo/cardano-serialization-lib-nodejs/cardano_serialization_lib');

export type Addr = Bech32String;

export type AssetEntry = {
  name: AssetName;
  policyId: PolicyId;
  nameHex: HexString;
  quantity: bigint;
};

export type TxOut = {
  txHash: TxHash;
  index: number;
  value: Value;
  addr: Addr;
  dataHash?: Hash32;
  dataBin?: HexString;
};

export type Value = AssetEntry[];

export type EncodedTxOut = HexString;
export type EncodedBalance = HexString;
export type EncodedAddress = HexString;
export type EncodedAmount = HexString;
export type RawUnsignedTx = HexString;

/**
 * carano wallets interface
 */
export interface CipWalletApi {
  getUtxos(
    amount?: EncodedAmount,
    paginate?: Paging,
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
