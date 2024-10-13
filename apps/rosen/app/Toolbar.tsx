import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

import { Toolbar as UiKitToolbar } from '@rosen-bridge/ui-kit';

import ToolbarActions from './ToolbarActions';

const pageTitleMap: Record<string, string> = {
  '(bridge)': 'Rosen Bridge',
  assets: 'Assets',
  dashboard: 'Dashboard',
  support: 'Support',
  transactions: 'Transactions',
};

/**
 * render toolbar containing page title and some actions
 */
const Toolbar = () => {
  const page = useSelectedLayoutSegment();

  return (
    <UiKitToolbar
      title={page ? pageTitleMap[page] ?? '' : ''}
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    />
  );
};

export default Toolbar;
