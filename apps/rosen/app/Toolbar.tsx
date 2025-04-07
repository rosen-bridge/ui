import React from 'react';

import {
  Stack,
  ToolbarThemeTogglerAction,
  useIsMobile,
  Version,
} from '@rosen-bridge/ui-kit';

import packageJson from '../package.json';

/**
 * render toolbar containing page actions
 */
export const Toolbar = () => {
  const isMobile = useIsMobile();
  return (
    <Stack direction="row">
      {isMobile && <Version label="UI" value={packageJson.version} />}
      <ToolbarThemeTogglerAction />
    </Stack>
  );
};
