type RpcEnvelope<T> = { result: T; error?: { message?: string } | null };

export async function zcashRpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const endpoint = process.env.ZCASH_RPC_URL;
  if (!endpoint) throw new Error('Zcash node is not configured');
  const url = new URL(endpoint);
  if (
    url.protocol !== 'https:' &&
    !(url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname))
  ) {
    throw new Error('Zcash node RPC must use HTTPS or local loopback');
  }

  const username = process.env.ZCASH_RPC_USERNAME;
  const password = process.env.ZCASH_RPC_PASSWORD;
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (username !== undefined && password !== undefined) {
    headers.set('Authorization', `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`);
  }
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: 'rosen-zcash-ui', method, params }),
    signal: AbortSignal.timeout(15_000),
    redirect: 'error',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Zcash node RPC failed (${response.status})`);
  const envelope = (await response.json()) as RpcEnvelope<T>;
  if (envelope.error || envelope.result === undefined) {
    throw new Error(`Zcash node RPC ${method} failed`);
  }
  return envelope.result;
}
