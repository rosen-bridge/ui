import {
  ToolbarThemeTogglerAction,
  Toolbar as UiKitToolbar,
  useIsMobile,
} from '@rosen-bridge/ui-kit';
import { ApiKeyModal } from '@rosen-bridge/ui-kit';

import { VersionConfig } from './VersionConfig';

/**
 * render toolbar containing page title and some actions
 */
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
