import { CipWalletApi, HexString, RawTx } from '../../types';

export const submit = (context: CipWalletApi, tx: RawTx): Promise<HexString> =>
  context.submitTx(tx);
