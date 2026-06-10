import { Icon, IconProps, IconButton } from '@/components';
import { useConfig, useIsDarkMode, useThemeToggler } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
      {isDarkMode ? (
        <Icon name="Sun" {...slots?.darkIcon} />
      ) : (
        <Icon name="Moon" {...slots?.lightIcon} />
      )}
    </IconButton>
  );
};

ThemeToggleButton.displayName = 'ThemeToggleButton';
