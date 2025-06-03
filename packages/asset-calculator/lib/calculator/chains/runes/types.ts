export type UnisatResponse<T> = {
  code: number;
  msg: string;
  data: T | null;
};

export type AddressRunesBalance = {
  amount: string;
  runeid: string;
  rune: string;
  spacedRune: string;
  symbol: string;
  divisibility: number;
};

export type RuneInfo = {
  runeid: string;
  rune: string;
  spacedRune: string;
  number: number;
  height: number;
  txidx: number;
  timestamp: number;
  divisibility: number;
  symbol: string;
  etching: string;
  premine: string;
  terms: RuneInfoTerms;
  mints: string;
  burned: string;
  holders: number;
  transactions: number;
  supply: string;
  start: number;
  end: number;
  mintable: boolean;
  remaining: string;
};

type RuneInfoTerms = {
  amount: string;
  cap: string;
  heightStart: number;
  heightEnd: number;
  offsetStart: number | null;
  offsetEnd: number | null;
};
