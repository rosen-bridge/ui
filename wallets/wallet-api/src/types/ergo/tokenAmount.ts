import { TokenId } from '../common';

export type TokenAmount = {
  readonly tokenId: TokenId;
  readonly amount: bigint;
  readonly name?: string;
  readonly decimals?: number;
};
export type TokenAmountProxy = {
  readonly tokenId: TokenId;
  readonly amount: string;
  readonly name?: string;
  readonly decimals?: number;
};
