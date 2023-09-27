import { DataInput } from './input';
import { UnsignedInput } from './unsignedInput';
import { ErgoBoxCandidate } from './ergoBoxCandidate';

export type UnsignedErgoTx = {
  readonly inputs: UnsignedInput[];
  readonly dataInputs: DataInput[];
  readonly outputs: ErgoBoxCandidate[];
};
