import { createHash } from 'node:crypto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { reserveAddress, rosenDataHex, rpcMock } = vi.hoisted(() => ({
  reserveAddress: 'tmLPctKo9j49rtCSKpwEBpLBeykiTGomGQs',
  rosenDataHex: '00000000000000138800000000000008982102cffa4dce4b92756fb861a7af4d303bd4e8178e635abcb24aeb56fb17a53e28af',
  rpcMock: vi.fn(),
}));

const genesisHash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

vi.mock('../../../configs', () => ({ LOCK_ADDRESSES: { zcash: reserveAddress } }));
vi.mock('@rosen-network/firo', () => ({ generateOpReturnData: vi.fn(async () => rosenDataHex) }));
vi.mock('@rosen-ui/constants', () => ({ NETWORKS: { ergo: { key: 'ergo' } } }));
vi.mock('./rpc', () => ({ zcashRpc: rpcMock }));

import { verifyZcashLockReceipt } from './verifyReceipt';

// The relevant fields of the confirmed synthetic NU6.3 v6 response, preserved verbatim.
const confirmedV6Transaction = {
  in_active_chain: true,
  hex: '0600008098b684d85b16a5370000000091000000019d8d5fd3c9f9f032bb9fc78b8ce844ccaeba473d5821aa6da024310f43af6249000000006a4730440220505b95ccf48ce5924a41864b47ef8c588b0296736fd810c483597efcf5651f930220091a7e1bf960423f6ece13adf6a84bea8b195637a223585bb5cd18a9683fc10f012103530f60982f1a312a7c03801539f0e4587f997a10e5107b33a44f3488d281a9e7ffffffff0380969800000000001976a914751e76e8199196d454941c45d1b3a323f1433bd688ac0000000000000000356a3300000000000000138800000000000008982102cffa4dce4b92756fb861a7af4d303bd4e8178e635abcb24aeb56fb17a53e28af60489800000000001976a9142d19eb13923d75c305a6a776c575cc066f4a47ad88ac00000000',
  confirmations: 1,
  vin: [{ txid: '4962af430f3124a06daa21583d47baaecc44e88c8bc79fbb32f0f9c9d35f8d9d' }],
  vout: [
    { valueZat: 10_000_000, scriptPubKey: { hex: '76a914751e76e8199196d454941c45d1b3a323f1433bd688ac', addresses: [reserveAddress] } },
    { valueZat: 0, scriptPubKey: { hex: `6a33${rosenDataHex}` } },
    { valueZat: 9_980_000, scriptPubKey: { hex: '76a9142d19eb13923d75c305a6a776c575cc066f4a47ad88ac' } },
  ],
  vShieldedSpend: [],
  vShieldedOutput: [],
  vjoinsplit: [],
  orchard: { actions: [], valueBalanceZat: 0 },
  valueBalanceZat: 0,
  txid: 'c81c8d8ba686b87640003e1b91deaf835e5e36a20337f82454ce2d28156a294e',
};

describe('verifyZcashLockReceipt', () => {
  beforeEach(() => {
    vi.stubEnv('ZCASH_NETWORK', 'regtest');
    vi.stubEnv('ZCASH_GENESIS_HASH', genesisHash);
    rpcMock.mockReset();
  });

  it('accepts the confirmed transparent v6 control and rejects the same transaction with Ironwood actions', async () => {
    const intentJson = JSON.stringify({
      type: 'rosen-zcash-lock-intent',
      version: 1,
      requestId: '00000000-0000-4000-8000-000000000001',
      source: { chain: 'zcash', network: 'regtest', genesisHash },
      reserveAddress,
      amountZat: '10000000',
      target: { chain: 'ergo', address: '9g6f2YnS9XkP44KCtkdX4CQNx4ej57ATdrHdX2DgBn6HZmGUWwP' },
      fees: { bridgeFee: '5000', networkFee: '2200' },
      rosenDataHex,
      createdAt: '2026-09-26T00:00:00.000Z',
      expiresAt: '2026-09-27T00:00:00.000Z',
    });
    const receiptJson = JSON.stringify({
      type: 'rosen-zcash-lock-receipt',
      version: 1,
      requestId: '00000000-0000-4000-8000-000000000001',
      intentSha256: createHash('sha256').update(intentJson).digest('hex'),
      sourceGenesisHash: genesisHash,
      txid: confirmedV6Transaction.txid,
      rawTxSha256: createHash('sha256').update(Buffer.from(confirmedV6Transaction.hex, 'hex')).digest('hex'),
      status: 'submitted',
    });

    rpcMock.mockImplementation(async (method: string) =>
      method === 'getblockhash' ? genesisHash : confirmedV6Transaction,
    );
    await expect(verifyZcashLockReceipt(intentJson, receiptJson)).resolves.toEqual({
      txid: confirmedV6Transaction.txid,
      confirmations: 1,
    });

    rpcMock.mockImplementation(async (method: string) =>
      method === 'getblockhash'
        ? genesisHash
        : { ...confirmedV6Transaction, ironwood: { actions: [{}], valueBalanceZat: 0 } },
    );
    await expect(verifyZcashLockReceipt(intentJson, receiptJson)).rejects.toThrow(
      'Zcash transaction is not a confirmed transparent lock',
    );
  });
});
