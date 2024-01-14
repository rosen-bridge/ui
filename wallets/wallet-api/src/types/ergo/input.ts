import { BoxId } from '../common';

import { ProverResult } from './prover';

export type Input = {
  readonly boxId: BoxId;
  readonly spendingProof: ProverResult;
};

export type DataInput = {
  readonly boxId: BoxId;
};
