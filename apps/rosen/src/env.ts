import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod/v4-mini';

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
          message: `must be valid JSON, received: ${raw}`,
          input: raw,
        });
        return z.NEVER;
      }

      const result = schema.safeParse(parsed);
      if (!result.success) {
        ctx.issues.push({ code: 'custom', message: result.error.message, input: raw });
        return z.NEVER;
      }

      return result.data as z.output<T>;
    }),
  );

export const env = createEnv({
  emptyStringAsUndefined: true,
  server: {
    TIMEOUT_THRESHOLD_SECONDS: z.coerce.number(),
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
    REQUIRED_PARTICIPANTS: z.coerce.number(),
    MINIMUM_PARTICIPANTS: z.coerce.number(),
    VETO_NUMBER: z.coerce.number(),

    POSTGRES_URL: z.string().check(z.minLength(1)),
    POSTGRES_USE_SSL: z.pipe(
      z.optional(z.string()),
      z.transform((value) => value === 'true'),
    ),

    APPLY_RATE_LIMIT: z.pipe(
      z.optional(z.string()),
      z.transform((value) => value === 'true'),
    ),
    RATE_LIMIT_TOKENS: z.optional(z.coerce.number()),
    RATE_LIMIT_WINDOW: z.optional(
      z
        .string()
        .check(z.regex(/^\d+ ?(ms|s|m|h|d)$/, 'must be a duration like "10 s", "10s" or "500ms"')),
    ),

    KV_REST_API_URL: z.optional(z.string()),
    KV_REST_API_TOKEN: z.optional(z.string()),

    ALLOWED_ORIGINS: z.optional(z.string()),

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
    NEXT_PUBLIC_BLOCKED_TOKENS: z.optional(z.string()),
    NEXT_PUBLIC_REOWN_PROJECT_ID: z.string().check(z.minLength(1)),
    NEXT_PUBLIC_SENTRY_DSN: z.optional(z.string()),
    NEXT_PUBLIC_BRIDGE_WARNING_MESSAGE: z.optional(z.string()),
    NEXT_PUBLIC_USE_OCTM: z.pipe(
      z.optional(z.string()),
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

    APPLY_RATE_LIMIT: process.env.APPLY_RATE_LIMIT,
    RATE_LIMIT_TOKENS: process.env.RATE_LIMIT_TOKENS,
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,

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

    NEXT_PUBLIC_ALLOWED_PKS: process.env.NEXT_PUBLIC_ALLOWED_PKS,
    NEXT_PUBLIC_BLOCKED_TOKENS: process.env.NEXT_PUBLIC_BLOCKED_TOKENS,
    NEXT_PUBLIC_REOWN_PROJECT_ID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_BRIDGE_WARNING_MESSAGE: process.env.NEXT_PUBLIC_BRIDGE_WARNING_MESSAGE,
    NEXT_PUBLIC_USE_OCTM: process.env.NEXT_PUBLIC_USE_OCTM,
  },
  createFinalSchema: (shape) =>
    z.object(shape).check(
      z.superRefine((value, ctx) => {
        if (
          value.APPLY_RATE_LIMIT &&
          (value.RATE_LIMIT_TOKENS === undefined || value.RATE_LIMIT_WINDOW === undefined)
        ) {
          ctx.issues.push({
            code: 'custom',
            message:
              'RATE_LIMIT_TOKENS and RATE_LIMIT_WINDOW must be set when APPLY_RATE_LIMIT is true',
            path: ['APPLY_RATE_LIMIT'],
            input: value,
          });
        }
      }),
    ),
});
