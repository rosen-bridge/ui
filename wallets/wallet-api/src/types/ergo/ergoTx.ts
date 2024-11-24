import { TxId } from '../common';
import { ErgoBoxProxy } from './ergoBox';
import { Input, DataInput } from './input';

export type ErgoTxProxy = {
  readonly id: TxId;
  readonly inputs: Input[];
  readonly dataInputs: DataInput[];
  readonly outputs: ErgoBoxProxy[];
  readonly size: number;
};
