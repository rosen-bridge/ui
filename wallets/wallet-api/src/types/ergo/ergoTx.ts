import { TxId } from '../common';

import { ErgoBox, ErgoBoxProxy } from './ergoBox';

import { Input, DataInput } from './input';

export type ErgoTx = {
  readonly id: TxId;
  readonly inputs: Input[];
  readonly dataInputs: DataInput[];
  readonly outputs: ErgoBox[];
  readonly size: number;
};

export type ErgoTxProxy = {
  readonly id: TxId;
  readonly inputs: Input[];
  readonly dataInputs: DataInput[];
  readonly outputs: ErgoBoxProxy[];
  readonly size: number;
};
