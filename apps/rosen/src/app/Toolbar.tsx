import React from 'react';

import {
  Toolbar as UiKitToolbar,
  ToolbarThemeTogglerAction,
  useIsMobile,
  Version,
} from '@rosen-bridge/ui-kit';

import packageJson from '../../package.json';

/**
 * render toolbar containing page actions
 */
export const Toolbar = () => {
  const isMobile = useIsMobile();
  return (
    <UiKitToolbar>
      {isMobile && <Version label="UI" value={packageJson.version} />}
      <ToolbarThemeTogglerAction />
    </UiKitToolbar>
  );
};
