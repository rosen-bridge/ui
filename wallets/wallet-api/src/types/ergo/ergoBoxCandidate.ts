import { ErgoTree } from './ergoTree';
import { Registers } from './registers';
import { TokenAmountProxy, TokenAmount } from './tokenAmount';

export declare type ErgoBoxCandidateProxy = {
  readonly value: string;
  readonly ergoTree: ErgoTree;
  readonly creationHeight: number;
  readonly assets: TokenAmountProxy[];
  readonly additionalRegisters: Registers;
};

export declare type ErgoBoxCandidate = {
  readonly value: bigint;
  readonly ergoTree: ErgoTree;
  readonly creationHeight: number;
  readonly assets: TokenAmount[];
  readonly additionalRegisters: Registers;
};
