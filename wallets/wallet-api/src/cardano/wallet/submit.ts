import { HexString, RawTx } from '../../types';
import { ConnectorContextApi } from '../../bridges';

export const submit = (
  context: ConnectorContextApi,
  tx: RawTx
): Promise<HexString> => context.submitTx(tx);
