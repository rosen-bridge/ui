import { getDataSource } from '@rosen-ui/data-source';

import { env } from '@/env';

export const dataSource = getDataSource(env.POSTGRES_URL, env.POSTGRES_USE_SSL, false);
