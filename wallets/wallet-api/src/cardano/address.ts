import { decodeHex } from '@rosen-ui/utils';

import { Addr, RawAddr, CardanoWasm } from '../types';

export function decodeAddr(raw: RawAddr, R: CardanoWasm): Addr {
  return R.Address.from_bytes(decodeHex(raw)).to_bech32();
}
