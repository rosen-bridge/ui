import * as Sentry from '@sentry/nextjs';

export async function register() {
  console.log('');
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('runMigrationssssssss');
    try {
      const { dataSource } = await import('@/backend/dataSource');
      if (!dataSource.isInitialized) await dataSource.initialize();
      await dataSource.runMigrations();
    } catch (error) {
      console.log('databaseeeeee migration error', error);
      throw new Error('runMigrations fails', { cause: error });
    }
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
