import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

import {
  ToolbarThemeTogglerAction,
  Toolbar as UiKitToolbar,
} from '@rosen-bridge/ui-kit';

import ApiKeyModal from './_modals/ApiKeyModal';

const pageTitleMap: Record<string, string> = {
  '(home)': 'Home',
  actions: 'Actions',
  events: 'Events',
  health: 'Health',
  observations: 'Observations',
  revenues: 'Revenues',
};

/**
 * render toolbar containing page title and some actions
 */
const Toolbar = () => {
  const page = useSelectedLayoutSegment();

  return (
    <UiKitToolbar
      title={page ? pageTitleMap[page] ?? '' : ''}
      toolbarActions={
        <>
          <ApiKeyModal />
          <ToolbarThemeTogglerAction />
        </>
      }
    />
  );
};

export default Toolbar;
