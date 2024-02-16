import { HexString, Hash32, TxHash } from '../common';
import { Value } from './value';
import { Addr } from './address';

export type TxOut = {
  txHash: TxHash;
  index: number;
  value: Value;
  addr: Addr;
  dataHash?: Hash32;
  dataBin?: HexString;
};
