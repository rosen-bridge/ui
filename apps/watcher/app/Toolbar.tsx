import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

import {
  ToolbarThemeTogglerAction,
  Toolbar as UiKitToolbar,
  useIsMobile,
} from '@rosen-bridge/ui-kit';
import { ApiKeyModal } from '@rosen-bridge/ui-kit';

import { VersionConfig } from './VersionConfig';

const pageTitleMap: Record<string, string> = {
  '(home)': 'Home',
  'actions': 'Actions',
  'events': 'Events',
  'health': 'Health',
  'observations': 'Observations',
  'revenues': 'Revenues',
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
          {isMobile && <VersionConfig />}
          <ApiKeyModal />
          <ToolbarThemeTogglerAction />
        </>
      }
    />
  );
};
