import { ComponentProps } from 'react';

import { Icon, IconButton, IconOverriddenProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { useIsDarkMode, useThemeToggler } from '@/hooks';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ThemeToggleButtonOverrides {}

export type ThemeToggleButtonOwnProps = {
  slots?: {
    darkIcon?: IconOverriddenProps;
    lightIcon?: IconOverriddenProps;
  };
};

export type ThemeToggleButtonBaseProps = ElementBaseProps<
  typeof IconButton,
  ThemeToggleButtonOwnProps
>;

export type ThemeToggleButtonOverriddenProps = OverridableType<
  ThemeToggleButtonBaseProps,
  ThemeToggleButtonOverrides,
  never
>;

export const ThemeToggleButtonBase = ({
  slots,
  ...rest
}: ThemeToggleButtonOverriddenProps) => {
  const isDarkMode = useIsDarkMode();

  const themeToggler = useThemeToggler();

  return (
    <IconButton color="inherit" onClick={themeToggler.toggle} {...rest}>
      {isDarkMode ? (
        <Icon name="Sun" {...slots?.darkIcon} />
      ) : (
        <Icon name="Moon" {...slots?.lightIcon} />
      )}
    </IconButton>
  );
};

ThemeToggleButtonBase.displayName = 'ThemeToggleButton';

export const ThemeToggleButton = Wrap(ThemeToggleButtonBase);

export type ThemeToggleButtonProps = ComponentProps<typeof ThemeToggleButton>;
