import React, { useContext } from 'react';

import { Moon, Sun } from '@rosen-bridge/icons';
import { IconButton, SvgIcon, useIsDarkMode } from '@rosen-bridge/ui-kit';
import ApiKeyModal from './_modals/ApiKeyModal';

import { ColorModeContext } from '@/_theme/ThemeProvider';

/**
 * render some toolbar actions
 */
const ToolbarActions = () => {
  const colorMode = useContext(ColorModeContext);
  const isDarkMode = useIsDarkMode();

  return (
    <>
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
    </>
  );
};

export default ToolbarActions;
