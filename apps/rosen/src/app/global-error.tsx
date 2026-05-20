'use client';

import NextError from 'next/error';
import { useEffect } from 'react';

import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag('layer', 'global-error');
      scope.captureException(error);
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
