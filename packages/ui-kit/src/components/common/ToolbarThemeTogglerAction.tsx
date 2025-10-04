import { Moon, Sun } from '@rosen-bridge/icons';

import { useIsDarkMode, useThemeToggler } from '../../hooks';
import { IconButton, SvgIconMui } from '../base';

export const ToolbarThemeTogglerAction = () => {
  const isDarkMode = useIsDarkMode();
  const themeToggler = useThemeToggler();
  return (
    <IconButton onClick={themeToggler.toggle} color="inherit">
      {isDarkMode ? (
        <SvgIconMui sx={{ width: 24 }}>
          <Sun />
        </SvgIconMui>
      ) : (
        <SvgIconMui sx={{ width: 24 }}>
          <Moon />
        </SvgIconMui>
      )}
    </IconButton>
  );
};
