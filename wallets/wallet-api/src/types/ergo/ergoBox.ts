import { BoxId, TxId } from '../common';

import { TokenAmount, TokenAmountProxy } from './tokenAmount';
import { Registers } from './registers';
import { ErgoTree } from './ergoTree';

export type ErgoBox = {
  readonly boxId: BoxId;
  readonly transactionId: TxId;
  readonly index: number;
  readonly ergoTree: ErgoTree;
  readonly creationHeight: number;
  readonly value: bigint;
  readonly assets: TokenAmount[];
  readonly additionalRegisters: Registers;
};

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
