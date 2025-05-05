import { Moon, Sun } from '@rosen-bridge/icons';

import { useIsDarkMode, useThemeToggler } from '../../hooks';
import { IconButton, SvgIcon } from '../base';

export const ToolbarThemeTogglerAction = () => {
  const isDarkMode = useIsDarkMode();
  const themeToggler = useThemeToggler();
  return (
    <IconButton onClick={themeToggler.toggle}>
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
  );
};
