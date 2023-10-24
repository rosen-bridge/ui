import { CipWalletApi, RawUnsignedTx } from '../../types';

import { RawTxWitnessSet } from '../../types';

export const sign = (
  context: CipWalletApi,
  tx: RawUnsignedTx,
  partialSign = false
): Promise<RawTxWitnessSet> => context.signTx(tx, partialSign);
