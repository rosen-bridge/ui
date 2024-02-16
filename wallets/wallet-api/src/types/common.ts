export type HexString = string;
export type Base58String = string;
export type TokenId = HexString;
export type TokenSymbol = string;
export type BoxId = HexString;
export type TxId = HexString;
export type NErg = bigint;

export type Address = Base58String;
export type AssetName = string;
export type ScriptHash = HexString;
export type PolicyId = ScriptHash;
export type RawTx = HexString;
export type Hash32 = HexString;
export type TxHash = Hash32;
export type Bech32String = string;
export type Lovelace = bigint;

export type RawTxWitnessSet = HexString;
export type RawTxOut = string[];
export type RawValue = string;
export type RawAddr = HexString;

export declare type Paging = {
  offset: number;
  limit: number;
};
