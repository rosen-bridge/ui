import React from 'react';

import {
  ToolbarThemeTogglerAction,
  Toolbar as UiKitToolbar,
  useIsMobile,
  ApiKeyModal,
} from '@rosen-bridge/ui-kit';

import { VersionConfig } from './VersionConfig';

export const Toolbar = () => {
  const isMobile = useIsMobile();

  return (
    <UiKitToolbar>
      {isMobile && <VersionConfig />}
      <ApiKeyModal />
      <ToolbarThemeTogglerAction />
    </UiKitToolbar>
  );
};
