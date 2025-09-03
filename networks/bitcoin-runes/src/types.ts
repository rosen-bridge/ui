export interface EsploraAddress {
  address: string;
  chain_stats: Stats;
  mempool_stats: Stats;
}

export interface Stats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}

export interface UnsignedPsbtData {
  psbt: {
    base64: string;
    hex: string;
  };
  inputSize: number;
}

export interface TokenInfo {
  id: string;
  value: bigint;
}

export interface AssetBalance {
  nativeToken: bigint;
  tokens: Array<TokenInfo>;
}

export interface OrdiscanResponse<T> {
  data: T;
}

export interface OrdiscanAddressUTXO {
  outpoint: string;
  value: number;
  runes: OrdiscanRuneBalance[];
  inscriptions: string[];
}

export interface OrdiscanRuneBalance {
  name: string;
  balance: string;
}

export type OrdiscanRuneInfo = {
  id: string;
  name: string;
  formatted_name: string;
  spacers: number;
  number: number;
  inscription_id: null;
  decimals: number;
  mint_count_cap: string;
  symbol: string;
  etching_txid: null;
  amount_per_mint: string;
  timestamp_unix: null;
  premined_amount: string;
  mint_start_block: number;
  mint_end_block: number;
  current_supply: string;
  current_mint_count: number;
};
