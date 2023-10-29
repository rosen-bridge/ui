import { ErgoTree } from './ergoTree';
import { Registers } from './registers';
import { TokenAmountProxy } from './tokenAmount';

export declare type ErgoBoxCandidateProxy = {
  readonly value: string;
  readonly ergoTree: ErgoTree;
  readonly creationHeight: number;
  readonly assets: TokenAmountProxy[];
  readonly additionalRegisters: Registers;
};
