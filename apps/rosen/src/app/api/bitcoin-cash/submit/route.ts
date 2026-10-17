import { createBitcoinCashSubmissionHandler } from '@rosen-network/bitcoin-cash/server/submission';

import { bitcoinCashPublicConfig } from '../../../../networks/bitcoin-cash/publicConfig';
import { getBitcoinCashServerRuntime } from '../../../../networks/bitcoin-cash/serverConfig';

export const runtime = 'nodejs';

/** Submit only explicitly enabled BCH through the dedicated bounded same-origin route. */
export async function POST(request: Request): Promise<Response> {
  if (!bitcoinCashPublicConfig)
    return Response.json(
      { error: 'BCH bridge unavailable' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  return createBitcoinCashSubmissionHandler({
    timeoutMs: bitcoinCashPublicConfig.walletTimeoutMs,
    getRuntime: getBitcoinCashServerRuntime,
  })(request);
}
