import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import type { TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';

import { AbstractDataAdapter } from './abstracts';
import type { ChainAssetBalance, ZcashRpcDataAdapterAuthParams } from './types';

export class ZcashRpcDataAdapter extends AbstractDataAdapter {
  chain = NETWORKS.zcash.key;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected rpc: ZcashRpcDataAdapterAuthParams,
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);
  }

  getAddressAssets = async (address: string): Promise<ChainAssetBalance[]> => {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (this.rpc.username !== undefined || this.rpc.password !== undefined) {
      if (this.rpc.username === undefined || this.rpc.password === undefined) {
        throw new Error('Zcash RPC credentials must include both username and password');
      }
      headers.authorization = `Basic ${Buffer.from(`${this.rpc.username}:${this.rpc.password}`).toString('base64')}`;
    }

    const response = await fetch(this.rpc.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getaddressbalance',
        params: [{ addresses: [address] }],
      }),
      signal: AbortSignal.timeout((this.rpc.timeout ?? 30) * 1000),
    });
    if (!response.ok) throw new Error(`Zcash RPC returned HTTP ${response.status}`);
    const envelope: unknown = await response.json();
    if (typeof envelope !== 'object' || envelope === null || Array.isArray(envelope)) {
      throw new Error('Invalid Zcash RPC response');
    }
    const { id, error, result } = envelope as Record<string, unknown>;
    if (id !== 1 || error != null || typeof result !== 'object' || result === null) {
      throw new Error('Invalid Zcash RPC response');
    }
    const balance = (result as Record<string, unknown>).balance;
    if (typeof balance !== 'number' || !Number.isSafeInteger(balance) || balance < 0) {
      throw new Error('Invalid Zcash RPC balance');
    }
    return [{ assetId: NETWORKS.zcash.nativeToken, balance: BigInt(balance) }];
  };

  getRawTotalSupply = async () => 0n;
}
