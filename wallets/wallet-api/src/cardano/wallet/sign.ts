import { ConnectorContextApi, RawUnsignedTx } from '../../bridges';

import { RawTxWitnessSet } from '../../types';

export const sign = (
  context: ConnectorContextApi,
  tx: RawUnsignedTx,
  partialSign = false
): Promise<RawTxWitnessSet> => context.signTx(tx, partialSign);
