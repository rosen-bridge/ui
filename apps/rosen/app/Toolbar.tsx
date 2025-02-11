import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

import {
  ToolbarThemeTogglerAction,
  Toolbar as UiKitToolbar,
  useIsMobile,
  Version,
} from '@rosen-bridge/ui-kit';

import packageJson from '../package.json';

const pageTitleMap: Record<string, string> = {
  '(bridge)': 'Rosen Bridge',
  'events': 'Events',
  'assets': 'Assets',
  'dashboard': 'Dashboard',
  'support': 'Support',
  'transactions': 'Transactions',
};

/**
 * render toolbar containing page title and some actions
 */
export const Toolbar = () => {
  const page = useSelectedLayoutSegment();
  const isMobile = useIsMobile();

  return (
    <UiKitToolbar
      title={page ? (pageTitleMap[page] ?? '') : ''}
      toolbarActions={
        <>
          {isMobile && <Version label="UI" value={packageJson.version} />}
          <ToolbarThemeTogglerAction />
        </>
      }
    />
  );
};
