import { afterEach, describe, expect, it, vi } from 'vitest';

const { candidate } = vi.hoisted(() => ({ candidate: { index: 10 } }));
vi.mock('@rosen-ui/constants', async () => {
  const actual = await vi.importActual<typeof import('@rosen-ui/constants')>('@rosen-ui/constants');
  return {
    ...actual,
    NETWORKS: {
      ...actual.NETWORKS,
      'bitcoin-cash': {
        ...actual.NETWORKS['bitcoin-cash'],
        get index() {
          return candidate.index;
        },
      },
    },
  };
});
vi.mock('../configs', async () => {
  const { signingIntent } = await import(
    '../../../networks/bitcoin-cash/tests/mocked/signing.mock'
  );
  return {
    LOCK_ADDRESSES: { 'bitcoin-cash': signingIntent().lockAddress },
    FEE_CONFIG_TOKEN_ID: '11'.repeat(32),
  };
});

/** Supply synthetic required legacy settings so the actual env validator isolates the new BCH join. */
const configure = () => {
  vi.resetModules();
  for (const name of [
    'CARDANO_KOIOS_API',
    'ERGO_EXPLORER_API',
    'BITCOIN_ESPLORA_API',
    'DOGE_BLOCKCYPHER_API',
    'FIRO_EXPLORER_API',
    'ETHEREUM_RPC_API',
    'BINANCE_RPC_API',
    'BITCOIN_RUNES_API',
    'HANDSHAKE_RPC_API',
  ])
    vi.stubEnv(name, 'https://example.invalid');
  vi.stubEnv('POSTGRES_URL', 'postgres://fixture:fixture@example.invalid/fixture');
  vi.stubEnv('BITCOIN_RUNES_SECRET', 'fixture');
  vi.stubEnv('NEXT_PUBLIC_REOWN_PROJECT_ID', '12'.repeat(16));
  vi.stubEnv('NEXT_PUBLIC_BCH_ENABLED', 'true');
  vi.stubEnv('NEXT_PUBLIC_BCH_NEXT_HEIGHT_INTERVAL', '100');
  vi.stubEnv('NEXT_PUBLIC_BCH_WALLET_TIMEOUT_MS', '30000');
  vi.stubEnv('BCH_ELECTRUM_HOSTNAME', 'electrum.example');
  vi.stubEnv('BCH_ELECTRUM_PORT', '50002');
  vi.stubEnv('BCH_ELECTRUM_TIMEOUT_MS', '30000');
  vi.stubEnv('BCH_FEE_RATE', '2');
  vi.stubEnv('BCH_MAX_FEE_SATOSHIS', '10000');
  vi.stubEnv('BCH_ALLOWED_DESTINATION_CHAINS', '["ergo"]');
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
};

afterEach(() => {
  candidate.index = 10;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('env', () => {
  /**
   * @target env validates enabled server settings through the actual final-schema hook
   * @dependencies Real env-nextjs/Zod final-schema hook and synthetic generated treasury/NFT.
   * @scenario Enable an assigned fixture network, then independently omit its provider hostname.
   * @expected Complete configuration succeeds; missing hostname rejects module initialization with fixed text.
   */
  it('validates enabled server settings through the actual final-schema hook', async () => {
    configure();
    const { env } = await import('../src/env');
    expect(env.NEXT_PUBLIC_BCH_ENABLED).toEqual(true);
    expect(env.BCH_ELECTRUM_HOSTNAME).toEqual('electrum.example');
    vi.resetModules();
    vi.stubEnv('BCH_ELECTRUM_HOSTNAME', undefined);
    await expect(import('../src/env')).rejects.toThrow(/^Invalid environment variables$/);
  });
  /**
   * @target env preserves disabled startup through the actual env module
   * @dependencies Actual env validator and synthetic required legacy settings.
   * @scenario Disable BCH, remove its provider settings and restore unassigned registry state.
   * @expected Initialize the env module without requiring BCH operator values.
   */
  it('preserves disabled startup through the actual env module', async () => {
    configure();
    candidate.index = -1;
    vi.stubEnv('NEXT_PUBLIC_BCH_ENABLED', 'false');
    for (const name of [
      'BCH_ELECTRUM_HOSTNAME',
      'BCH_ELECTRUM_PORT',
      'BCH_ELECTRUM_TIMEOUT_MS',
      'BCH_FEE_RATE',
      'BCH_MAX_FEE_SATOSHIS',
      'BCH_ALLOWED_DESTINATION_CHAINS',
    ])
      vi.stubEnv(name, undefined);
    const { env } = await import('../src/env');
    expect(env.NEXT_PUBLIC_BCH_ENABLED).toEqual(false);
    expect(env.BCH_ELECTRUM_HOSTNAME).toEqual(undefined);
  });

  /**
   * @target env rejects enabled startup before Rosen assigns the BCH index
   * @dependencies Actual final-schema hook and otherwise complete configuration.
   * @scenario Enable BCH with all required settings, leaving only its index -1.
   * @expected Reject module initialization with the fixed configuration error.
   */
  it('rejects enabled startup before Rosen assigns the BCH index', async () => {
    configure();
    candidate.index = -1;
    await expect(import('../src/env')).rejects.toThrow(/^Invalid environment variables$/);
  });
});
