import { SvgIcon } from '@mui/material';
import { Moon, Sun } from '@rosen-bridge/icons';

import { useIsDarkMode, useThemeToggler } from '../../hooks';
import { IconButton } from '../base';

export const ToolbarThemeTogglerAction = () => {
  const isDarkMode = useIsDarkMode();
  const themeToggler = useThemeToggler();
  return (
    <IconButton onClick={themeToggler.toggle} color="inherit">
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
