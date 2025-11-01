'use server';

import { RosenTokens } from '@rosen-bridge/tokens';
import { createClient } from '@vercel/kv';

import { wrap } from '@/safeServerAction';

/**
 * get rosen tokens object from redis or throw error if data is missing
 */
export const getOnChainRosenTokens = async () => {
  const redis = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  const storedTokenMap: {
    hash: string;
    tokenMap: RosenTokens;
  } | null = await redis.get('token-map');

  if (storedTokenMap) return storedTokenMap;

  throw new Error(`token-map key does not exist in redis`);
};

export const getOnChainRosenTokensWithCache = wrap(getOnChainRosenTokens, {
  cache: undefined,
  traceKey: 'getOnChainRosenTokens',
});
