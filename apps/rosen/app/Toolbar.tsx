import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

import {
  ToolbarThemeTogglerAction,
  Toolbar as UiKitToolbar,
} from '@rosen-bridge/ui-kit';

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
      toolbarActions={<ToolbarThemeTogglerAction />}
    />
  );
};

export default Toolbar;
