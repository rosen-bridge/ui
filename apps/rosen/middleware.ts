import { NextResponse, NextRequest } from 'next/server';

import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

type Duration = Parameters<typeof Ratelimit.slidingWindow>[1];
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

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';

  const success = (await rateLimit?.limit(ip))?.success ?? true;

  if (!success) {
    return Response.json('Too many requests', { status: 429 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
