import { TokenId } from '../common';

export type TokenAmountProxy = {
  readonly tokenId: TokenId;
  readonly amount: string;
  readonly name?: string;
  readonly decimals?: number;
};
