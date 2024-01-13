import React, { Fragment, useContext } from 'react';

import { Moon, Sun, Setting } from '@rosen-bridge/icons';
import { IconButton, SvgIcon, useIsDarkMode } from '@rosen-bridge/ui-kit';

import { ColorModeContext } from '@/_theme/ThemeProvider';
import { useRouter } from 'next/navigation';
import ApiKeyModal from './ApiKeyModal';

/**
 * render some toolbar actions
 */
const ToolbarActions = () => {
  const colorMode = useContext(ColorModeContext);
  const isDarkMode = useIsDarkMode();
  const router = useRouter();

  return (
    <Fragment>
      <ApiKeyModal />
      <IconButton onClick={colorMode.toggle} size="large">
        {isDarkMode ? (
          <SvgIcon sx={{ width: 24 }}>
            <Sun />
          </SvgIcon>
        ) : (
          <SvgIcon sx={{ width: 24 }}>
            <Moon />
          </SvgIcon>
        )}
      </IconButton>
      <IconButton onClick={() => router.push('/settings')} size="large">
        <SvgIcon sx={{ width: 24 }}>
          <Setting />
        </SvgIcon>
      </IconButton>
    </Fragment>
  );
};

export default ToolbarActions;
