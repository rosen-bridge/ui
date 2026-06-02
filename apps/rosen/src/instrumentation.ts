import * as Sentry from '@sentry/nextjs';

export async function register() {
  console.log('REgiiiisterrrrrrrrrr');
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('runMigrationssssssss');
    const { dataSource } = await import('@/backend/dataSource');
    if (!dataSource.isInitialized) await dataSource.initialize();
    await dataSource.runMigrations();
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
