import { HexString } from '../common';

import { ErgoTx } from './ergoTx';
import { Input } from './input';
import { UnsignedErgoTx } from './unsignedErgoTx';

export type ContextExtension = {
  [key: string]: HexString;
};

export type ProverResult = {
  readonly proof: Uint8Array;
  readonly extension: ContextExtension;
};

export interface Prover {
  sign?: (tx: UnsignedErgoTx) => Promise<ErgoTx>;
  signInput?: (tx: UnsignedErgoTx, input: number) => Promise<Input>;
}
