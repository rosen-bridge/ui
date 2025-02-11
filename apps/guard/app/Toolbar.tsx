import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';
import { useMemo } from 'react';

import {
  ToolbarThemeTogglerAction,
  Toolbar as UiKitToolbar,
  useIsMobile,
  Version,
} from '@rosen-bridge/ui-kit';
import { ApiKeyModal } from '@rosen-bridge/ui-kit';

import packageJson from '../package.json';
import { useInfo } from './_hooks/useInfo';

const pageTitleMap: Record<string, string> = {
  '(dashboard)': 'Dashboard',
  'assets': 'Assets',
  'events': 'Events',
  'health': 'Health',
  'history': 'History',
  'revenues': 'Revenues',
};

/**
 * render toolbar containing page title and some actions
 */
export const Toolbar = () => {
  const page = useSelectedLayoutSegment();
  const { data: info, isLoading } = useInfo();

  const sub = useMemo(() => {
    const result = [
      {
        label: 'UI',
        value: packageJson.version,
      },
      {
        label: 'Contract',
        value: info?.versions.contract,
      },
    ];
    if (!isLoading && info?.versions.contract !== info?.versions.tokensMap) {
      result.push({
        label: 'Tokens',
        value: info?.versions.tokensMap,
      });
    }
    return result;
  }, [info, isLoading]);

  const isMobile = useIsMobile();

  return (
    <UiKitToolbar
      title={page ? (pageTitleMap[page] ?? '') : ''}
      toolbarActions={
        <>
          {isMobile && (
            <Version label="Guard" value={info?.versions.app} sub={sub} />
          )}
          <ApiKeyModal />
          <ToolbarThemeTogglerAction />
        </>
      }
    />
  );
};
