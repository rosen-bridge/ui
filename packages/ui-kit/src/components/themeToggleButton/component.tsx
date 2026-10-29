import { Icon, IconButton, type IconProps, Transition } from '@/components';
import { useConfig, useIsDarkMode, useThemeToggler } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface ThemeToggleButtonOverrides {}

export type ThemeToggleButtonOwnProps = {
  slots?: {
    darkIcon?: IconProps;
    lightIcon?: IconProps;
  };
};

export type ThemeToggleButtonBaseProps = ElementBaseProps<
  typeof IconButton,
  ThemeToggleButtonOwnProps
>;

export type ThemeToggleButtonProps = OverridableType<
  ThemeToggleButtonBaseProps,
  ThemeToggleButtonOverrides,
  never
>;

export const ThemeToggleButton = (props: ThemeToggleButtonProps) => {
  const { slots, ...rest } = useConfig('ThemeToggleButton', props);

  const isDarkMode = useIsDarkMode();

  const themeToggler = useThemeToggler();

  return (
    <IconButton color="inherit" onClick={themeToggler.toggle} {...rest}>
      <Transition>
        {isDarkMode ? (
          <Icon key="dark" name="Sun" {...slots?.darkIcon} />
        ) : (
          <Icon key="light" name="Moon" {...slots?.lightIcon} />
        )}
      </Transition>
    </IconButton>
  );
};

ThemeToggleButton.displayName = 'ThemeToggleButton';
