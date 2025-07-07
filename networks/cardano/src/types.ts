export interface CardanoProtocolParams {
  min_fee_a: number;
  min_fee_b: number;
  pool_deposit: string;
  key_deposit: string;
  max_value_size: number;
  max_tx_size: number;
  coins_per_utxo_size: string;
}

export const ADA_POLICY_ID = '';

export type Bech32String = string;
export type HexString = string;
export type AssetName = string;
export type PolicyId = ScriptHash;
export type Hash32 = HexString;
export type TxHash = Hash32;
export type Lovelace = bigint;
export declare type Paging = {
  offset: number;
  limit: number;
};
export type RawTx = HexString;
export type TxId = HexString;
export type ScriptHash = HexString;

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
