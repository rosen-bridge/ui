import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

import { Toolbar as UiKitToolbar } from '@rosen-bridge/ui-kit';

import ToolbarActions from './ToolbarActions';

const pageTitleMap: Record<string, string> = {
  '(dashboard)': 'Dashboard',
  assets: 'Assets',
  events: 'Events',
  health: 'Health',
  history: 'History',
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
      toolbarActions={<ToolbarActions />}
    />
  );
};

export default Toolbar;
