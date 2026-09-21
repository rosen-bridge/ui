import { type NextRequest, NextResponse } from 'next/server';

import { Ratelimit } from '@upstash/ratelimit';
import { ipAddress } from '@vercel/functions';
import { kv } from '@vercel/kv';

import { env } from '@/env';

type Duration = Parameters<typeof Ratelimit.slidingWindow>[1];

const rateLimit = (() => {
  if (!env.APPLY_RATE_LIMIT || !env.RATE_LIMIT_TOKENS || !env.RATE_LIMIT_WINDOW) return;
  return new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(env.RATE_LIMIT_TOKENS, env.RATE_LIMIT_WINDOW as Duration),
  });
})();

/**
 * check if origin is an allowed origin from CORS perspective
 * @param origin
 */
const isOriginAllowed = (origin: string) =>
  env.ALLOWED_ORIGINS?.includes('*') || env.ALLOWED_ORIGINS?.includes(origin);

/**
 * get a headers object through which CORS can be enabled
 * @param origin
 */
const getCORSHeaders = (origin: string) => {
  const responseHeaders = new Headers();
  responseHeaders.append('Access-Control-Allow-Methods', 'GET');
  responseHeaders.append('Access-Control-Allow-Headers', 'Content-Type');
  responseHeaders.append('Access-Control-Allow-Origin', origin);

  return responseHeaders;
};

export async function proxy(request: NextRequest) {
  const ip = ipAddress(request) ?? '127.0.0.1';

  const success = (await rateLimit?.limit(ip))?.success ?? true;

  if (!success) {
    return Response.json('Too many requests', { status: 429 });
  }

  const origin = request.headers.get('Origin');
  if (request.url.includes('/api') && origin && isOriginAllowed(origin)) {
    return NextResponse.next({ headers: getCORSHeaders(origin) });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
