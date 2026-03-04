import { ComponentProps } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { OverridableType } from '../../@types';
import { Icon } from '../icon';
import { IconButton } from '../iconButton';
import { useIsDarkMode, useThemeToggler } from '../../hooks';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ThemeToggleButtonOverrides { }

export type ThemeToggleButtonOwnProps = {};

export type ThemeToggleButtonBaseProps = ElementBaseProps<typeof IconButton, ThemeToggleButtonOwnProps>;

export type ThemeToggleButtonOverriddenProps = OverridableType<
  ThemeToggleButtonBaseProps,
  ThemeToggleButtonOverrides,
  never
>;

export const ThemeToggleButtonBase = ({ ...rest }: ThemeToggleButtonOverriddenProps) => {
  const isDarkMode = useIsDarkMode();

  const themeToggler = useThemeToggler();

  return (
    <Root as={IconButton} color="inherit" onClick={themeToggler.toggle} {...rest}>
      <Icon name={isDarkMode ? 'Sun' : 'Moon'} />
    </Root>
  )
};

ThemeToggleButtonBase.displayName = 'ThemeToggleButton';

export const ThemeToggleButton = Wrap(ThemeToggleButtonBase);

export type ThemeToggleButtonProps = ComponentProps<typeof ThemeToggleButton>;
