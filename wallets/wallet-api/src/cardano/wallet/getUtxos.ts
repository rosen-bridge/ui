import { CipWalletApi } from '../../types';

import { RawTxOut } from '../../types';

export const getUtxos = async (context: CipWalletApi): Promise<RawTxOut> => {
  const rawUtxos = await context.getUtxos();
  return rawUtxos || [];
};
