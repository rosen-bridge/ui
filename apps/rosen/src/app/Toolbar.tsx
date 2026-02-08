import React from 'react';

import {
  Toolbar as UiKitToolbar,
  ToolbarThemeTogglerAction,
  useIsMobile,
} from '@rosen-bridge/ui-kit';

import { VersionConfig } from './VersionConfig';

/**
 * render toolbar containing page actions
 */
export const Toolbar = () => {
  const isMobile = useIsMobile();
  return (
    <UiKitToolbar>
      {isMobile && <VersionConfig />}
      <ToolbarThemeTogglerAction />
    </UiKitToolbar>
  );
};
