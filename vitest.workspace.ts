import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/guard',
  'apps/rosen',
  'apps/rosen-service',
  'apps/watcher',
  'networks/*',
  'packages/*',
  'wallets/*',
]);
