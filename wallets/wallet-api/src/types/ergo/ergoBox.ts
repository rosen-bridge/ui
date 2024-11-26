import { BoxId, TxId } from '../common';
import { ErgoTree } from './ergoTree';
import { Registers } from './registers';
import { TokenAmountProxy } from './tokenAmount';

export type ErgoBoxProxy = {
  readonly boxId: BoxId;
  readonly transactionId: TxId;
  readonly index: number;
  readonly ergoTree: ErgoTree;
  readonly creationHeight: number;
  readonly value: string;
  readonly assets: TokenAmountProxy[];
  readonly additionalRegisters: Registers;
};
