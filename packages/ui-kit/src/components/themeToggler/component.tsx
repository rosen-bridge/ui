import { ComponentProps } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { OverridableType } from '../../@types';
import { Icon } from '../icon';
import { IconButton } from '../iconButton';
import { useIsDarkMode, useThemeToggler } from '../../hooks';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ThemeTogglerOverrides { }

export type ThemeTogglerOwnProps = {};

export type ThemeTogglerBaseProps = ElementBaseProps<typeof IconButton, ThemeTogglerOwnProps>;

export type ThemeTogglerOverriddenProps = OverridableType<
  ThemeTogglerBaseProps,
  ThemeTogglerOverrides,
  never
>;

export const ThemeTogglerBase = ({ ...rest }: ThemeTogglerOverriddenProps) => {
  const isDarkMode = useIsDarkMode();

  const themeToggler = useThemeToggler();

  return (
    <Root as={IconButton} color="inherit" onClick={themeToggler.toggle} {...rest}>
      <Icon name={isDarkMode ? 'Sun' : 'Moon'} />
    </Root>
  )
};

ThemeTogglerBase.displayName = 'ThemeToggler';

export const ThemeToggler = Wrap(ThemeTogglerBase);

export type ThemeTogglerProps = ComponentProps<typeof ThemeToggler>;
