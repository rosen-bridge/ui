import { HexString } from '../common';

export type ContextExtension = {
  [key: string]: HexString;
};

export type ProverResult = {
  readonly proof: Uint8Array;
  readonly extension: ContextExtension;
};
