import { TokenMap } from '@rosen-bridge/tokens';

import { getRosenTokens } from '@/_backend/utils';

export const tokenMap = new TokenMap(getRosenTokens());
