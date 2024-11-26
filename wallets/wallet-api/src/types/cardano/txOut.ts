import { HexString, Hash32, TxHash } from '../common';
import { Addr } from './address';
import { Value } from './value';

export type TxOut = {
  txHash: TxHash;
  index: number;
  value: Value;
  addr: Addr;
  dataHash?: Hash32;
  dataBin?: HexString;
};
