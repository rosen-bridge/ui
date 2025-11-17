import { Moon, Sun } from '@rosen-bridge/icons';

import { useIsDarkMode, useThemeToggler } from '../../hooks';
import { IconButton } from '../base';
import { SvgIcon } from './SvgIcon';

export const ToolbarThemeTogglerAction = () => {
  const isDarkMode = useIsDarkMode();
  const themeToggler = useThemeToggler();
  return (
    <IconButton onClick={themeToggler.toggle} color="inherit">
      {isDarkMode ? (
        <SvgIcon size="medium">
          <Sun />
        </SvgIcon>
      ) : (
        <SvgIcon size="medium">
          <Moon />
        </SvgIcon>
      )}
    </IconButton>
  );
};
