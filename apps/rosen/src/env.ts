import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod/v4-mini';

import { FEE_CONFIG_TOKEN_ID, LOCK_ADDRESSES } from '../configs';
import { validateBitcoinCashStartup } from './networks/bitcoin-cash/startup';

const jsonEnv = <T extends z.ZodMiniType>(schema: T) =>
  z.pipe(
    z.optional(z.string()),
    z.transform((value, ctx) => {
      const raw = value ?? '[]';

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        ctx.issues.push({
          code: 'custom',
          message: 'must be valid JSON',
          input: undefined,
        });
        return z.NEVER;
      }

      const result = schema.safeParse(parsed);
      if (!result.success) {
        result.error.issues.forEach(({ path, message }) =>
          ctx.issues.push({ code: 'custom', path, message, input: undefined }),
        );
        return z.NEVER;
      }

      return result.data as z.output<T>;
    }),
  );

export const env = createEnv({
  emptyStringAsUndefined: true,
  onValidationError: (issues) => {
    console.error(
      '❌ Invalid environment variables:',
      issues.map(({ path, message }) => ({ path, message })),
    );
    throw new Error('Invalid environment variables');
  },
  server: {
    TIMEOUT_THRESHOLD_SECONDS: z._default(z.coerce.number(), 30),
    EVENT_STATUS_THRESHOLDS: jsonEnv(
      z.array(
        z.object({
          key: z.string(),
          count: z.number(),
        }),
      ),
    ),
    TX_STATUS_THRESHOLDS: jsonEnv(
      z.array(
        z.object({
          key: z.string(),
          count: z.number(),
        }),
      ),
    ),
    REQUIRED_PARTICIPANTS: z._default(z.coerce.number(), 6),
    MINIMUM_PARTICIPANTS: z._default(z.coerce.number(), 1),
    VETO_NUMBER: z._default(z.coerce.number(), 5),

    POSTGRES_URL: z.string().check(z.minLength(1)),
    POSTGRES_USE_SSL: z.pipe(
      z.optional(z.enum(['true', 'false'])),
      z.transform((value) => value === 'true'),
    ),

    RATE_LIMIT_REQUESTS: z.optional(z.coerce.number()),
    RATE_LIMIT_WINDOW: z.optional(
      z
        .string()
        .check(z.regex(/^\d+ ?(ms|s|m|h|d)$/, 'must be a duration like "10 s", "10s" or "500ms"')),
    ),

    API_CACHE_SECONDS: z.optional(z.coerce.number().check(z.gt(0))),

    KV_REST_API_URL: z.optional(z.string()),
    KV_REST_API_TOKEN: z.optional(z.string()),

    ALLOWED_ORIGINS: jsonEnv(z.array(z.string())),

    SENTRY_ORG: z.optional(z.string()),
    SENTRY_PROJECT: z.optional(z.string()),
    SENTRY_AUTH_TOKEN: z.optional(z.string()),

    DISCORD_NOTIFICATION_WEBHOOK_URL: z.optional(z.string()),

    IGNORE_TOKEN_ICONS: jsonEnv(z.array(z.string())),

    CARDANO_KOIOS_API: z.url(),
    ERGO_EXPLORER_API: z.url(),
    BITCOIN_ESPLORA_API: z.url(),
    DOGE_BLOCKCYPHER_API: z.url(),
    FIRO_EXPLORER_API: z.url(),
    ETHEREUM_RPC_API: z.url(),
    BINANCE_RPC_API: z.url(),
    BITCOIN_RUNES_API: z.url(),
    BITCOIN_RUNES_SECRET: z.string().check(z.minLength(1)),
    HANDSHAKE_RPC_API: z.url(),
    BCH_ELECTRUM_HOSTNAME: z.optional(z.string()),
    BCH_ELECTRUM_PORT: z.optional(z.string()),
    BCH_ELECTRUM_TIMEOUT_MS: z.optional(z.string()),
    BCH_FEE_RATE: z.optional(z.string()),
    BCH_MAX_FEE_SATOSHIS: z.optional(z.string()),
    BCH_ALLOWED_DESTINATION_CHAINS: jsonEnv(z.array(z.string())),
  },
  client: {
    NEXT_PUBLIC_ALLOWED_PKS: jsonEnv(
      z.array(
        z.object({
          key: z.string(),
          label: z.string(),
        }),
      ),
    ),
    NEXT_PUBLIC_BLOCKED_TOKENS: z._default(z.string(), ''),
    NEXT_PUBLIC_REOWN_PROJECT_ID: z.string().check(z.minLength(1)),
    NEXT_PUBLIC_BCH_ENABLED: z.pipe(
      z.optional(z.enum(['true', 'false'])),
      z.transform((value) => value === 'true'),
    ),
    NEXT_PUBLIC_BCH_NEXT_HEIGHT_INTERVAL: z.optional(z.string()),
    NEXT_PUBLIC_BCH_WALLET_TIMEOUT_MS: z.optional(z.string()),
    NEXT_PUBLIC_SENTRY_DSN: z.optional(z.string()),
    NEXT_PUBLIC_BRIDGE_WARNING_MESSAGE: z.optional(z.string()),
    NEXT_PUBLIC_USE_OCTM: z.pipe(
      z.optional(z.enum(['true', 'false'])),
      z.transform((value) => value === 'true'),
    ),
  },
  runtimeEnv: {
    TIMEOUT_THRESHOLD_SECONDS: process.env.TIMEOUT_THRESHOLD_SECONDS,
    EVENT_STATUS_THRESHOLDS: process.env.EVENT_STATUS_THRESHOLDS,
    TX_STATUS_THRESHOLDS: process.env.TX_STATUS_THRESHOLDS,
    REQUIRED_PARTICIPANTS: process.env.REQUIRED_PARTICIPANTS,
    MINIMUM_PARTICIPANTS: process.env.MINIMUM_PARTICIPANTS,
    VETO_NUMBER: process.env.VETO_NUMBER,

    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_USE_SSL: process.env.POSTGRES_USE_SSL,

    RATE_LIMIT_REQUESTS: process.env.RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,

    API_CACHE_SECONDS: process.env.API_CACHE_SECONDS,

    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,

    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,

    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,

    DISCORD_NOTIFICATION_WEBHOOK_URL: process.env.DISCORD_NOTIFICATION_WEBHOOK_URL,

    IGNORE_TOKEN_ICONS: process.env.IGNORE_TOKEN_ICONS,

    CARDANO_KOIOS_API: process.env.CARDANO_KOIOS_API,
    ERGO_EXPLORER_API: process.env.ERGO_EXPLORER_API,
    BITCOIN_ESPLORA_API: process.env.BITCOIN_ESPLORA_API,
    DOGE_BLOCKCYPHER_API: process.env.DOGE_BLOCKCYPHER_API,
    FIRO_EXPLORER_API: process.env.FIRO_EXPLORER_API,
    ETHEREUM_RPC_API: process.env.ETHEREUM_RPC_API,
    BINANCE_RPC_API: process.env.BINANCE_RPC_API,
    BITCOIN_RUNES_API: process.env.BITCOIN_RUNES_API,
    BITCOIN_RUNES_SECRET: process.env.BITCOIN_RUNES_SECRET,
    HANDSHAKE_RPC_API: process.env.HANDSHAKE_RPC_API,
    BCH_ELECTRUM_HOSTNAME: process.env.BCH_ELECTRUM_HOSTNAME,
    BCH_ELECTRUM_PORT: process.env.BCH_ELECTRUM_PORT,
    BCH_ELECTRUM_TIMEOUT_MS: process.env.BCH_ELECTRUM_TIMEOUT_MS,
    BCH_FEE_RATE: process.env.BCH_FEE_RATE,
    BCH_MAX_FEE_SATOSHIS: process.env.BCH_MAX_FEE_SATOSHIS,
    BCH_ALLOWED_DESTINATION_CHAINS: process.env.BCH_ALLOWED_DESTINATION_CHAINS,

    NEXT_PUBLIC_ALLOWED_PKS: process.env.NEXT_PUBLIC_ALLOWED_PKS,
    NEXT_PUBLIC_BLOCKED_TOKENS: process.env.NEXT_PUBLIC_BLOCKED_TOKENS,
    NEXT_PUBLIC_REOWN_PROJECT_ID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
    NEXT_PUBLIC_BCH_ENABLED: process.env.NEXT_PUBLIC_BCH_ENABLED,
    NEXT_PUBLIC_BCH_NEXT_HEIGHT_INTERVAL: process.env.NEXT_PUBLIC_BCH_NEXT_HEIGHT_INTERVAL,
    NEXT_PUBLIC_BCH_WALLET_TIMEOUT_MS: process.env.NEXT_PUBLIC_BCH_WALLET_TIMEOUT_MS,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_BRIDGE_WARNING_MESSAGE: process.env.NEXT_PUBLIC_BRIDGE_WARNING_MESSAGE,
    NEXT_PUBLIC_USE_OCTM: process.env.NEXT_PUBLIC_USE_OCTM,
  },
  createFinalSchema: (shape, isServer) =>
    z.object(shape).check(
      z.superRefine((value, ctx) => {
        try {
          validateBitcoinCashStartup(
            {
              enabled: value.NEXT_PUBLIC_BCH_ENABLED,
              lockAddress: LOCK_ADDRESSES['bitcoin-cash'],
              nextHeightInterval: value.NEXT_PUBLIC_BCH_NEXT_HEIGHT_INTERVAL,
              walletTimeoutMs: value.NEXT_PUBLIC_BCH_WALLET_TIMEOUT_MS,
              projectId: value.NEXT_PUBLIC_REOWN_PROJECT_ID,
              hostname: value.BCH_ELECTRUM_HOSTNAME,
              port: value.BCH_ELECTRUM_PORT,
              timeoutMs: value.BCH_ELECTRUM_TIMEOUT_MS,
              feeRate: value.BCH_FEE_RATE,
              maxFeeSatoshis: value.BCH_MAX_FEE_SATOSHIS,
              allowedDestinationChains: value.BCH_ALLOWED_DESTINATION_CHAINS,
              minimumFeeNFT: FEE_CONFIG_TOKEN_ID,
            },
            isServer,
          );
        } catch {
          ctx.issues.push({
            code: 'custom',
            message: 'Enabled BCH requires assigned chain and complete bridge configuration',
            path: ['NEXT_PUBLIC_BCH_ENABLED'],
            input: undefined,
          });
        }
        const hasRequests = value.RATE_LIMIT_REQUESTS !== undefined;
        const hasWindow = value.RATE_LIMIT_WINDOW !== undefined;
        if (hasRequests !== hasWindow) {
          const [missing, present] = hasRequests
            ? ['RATE_LIMIT_WINDOW', 'RATE_LIMIT_REQUESTS']
            : ['RATE_LIMIT_REQUESTS', 'RATE_LIMIT_WINDOW'];
          ctx.issues.push({
            code: 'custom',
            message: `${missing} must be set when ${present} is set (set both to enable rate limiting, or remove ${present})`,
            path: [missing],
            input: undefined,
          });
        }
      }),
    ),
});
