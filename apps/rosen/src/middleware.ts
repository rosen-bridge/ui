import { NextResponse, NextRequest } from 'next/server';

import * as Sentry from '@sentry/nextjs';
import { Ratelimit } from '@upstash/ratelimit';
import { ipAddress } from '@vercel/functions';
import { kv } from '@vercel/kv';

type Duration = Parameters<typeof Ratelimit.slidingWindow>[1];

/** Upstash sliding-window rate limiter, enabled if APPLY_RATE_LIMIT='true' using env tokens and window. */
const rateLimit =
  process.env.APPLY_RATE_LIMIT === 'true'
    ? new Ratelimit({
        redis: kv,
        limiter: Ratelimit.slidingWindow(
          +process.env.RATE_LIMIT_TOKENS!,
          process.env.RATE_LIMIT_WINDOW! as Duration,
        ),
      })
    : undefined;

/**
 * check if origin is an allowed origin from CORS perspective
 * @param origin
 */
const isOriginAllowed = (origin: string) =>
  process.env.ALLOWED_ORIGINS?.includes('*') ||
  process.env.ALLOWED_ORIGINS?.includes(origin);

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

const logApiRequestBody = async (request: NextRequest) => {
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  if (!isApiRoute) return;

  if (request.method === 'GET' || request.method === 'HEAD') return;

  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) return;

  let body: unknown = null;

  try {
    body = await request.clone().json();
  } catch {
    body = 'Cannot parse body';
  }

  Sentry.logger.info('api.request', {
    method: request.method,
    path: request.nextUrl.pathname,
    body: body,
  });
};

export async function middleware(request: NextRequest) {
  const ip = ipAddress(request) ?? '127.0.0.1';

  const success = (await rateLimit?.limit(ip))?.success ?? true;

  if (!success) {
    return Response.json('Too many requests', { status: 429 });
  }

  await logApiRequestBody(request);

  const origin = request.headers.get('Origin');
  if (request.url.includes('/api') && origin && isOriginAllowed(origin)) {
    return NextResponse.next({ headers: getCORSHeaders(origin) });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
