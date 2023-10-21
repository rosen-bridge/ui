import { ConnectorContextApi } from '../../bridges';

import { RawTxOut } from '../../types';

export const getUtxos = async (
  context: ConnectorContextApi
): Promise<RawTxOut> => {
  const rawUtxos = await context.getUtxos();
  return rawUtxos || [];
};
