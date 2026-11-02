import { defineRoute } from '@/app/api/defineRoute';
import { getHeightNetworks } from '@/backend/heightNetworks/services';

export const GET = defineRoute({
  cache: 30,
  handler: () => getHeightNetworks(),
});
