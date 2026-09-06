import { type IconProps, Link } from '@/components';
import { Icon } from '@/components/icon';
import { useBreakpoint, useConfig, useFramework } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface NavigationButtonOverrides {}

export type NavigationButtonOwnProps = {
  icon: IconProps['name'];
  disabled?: boolean;
};

export type NavigationButtonBaseProps = ElementBaseProps<typeof Link, NavigationButtonOwnProps>;

export type NavigationButtonProps = OverridableType<
  NavigationButtonBaseProps,
  NavigationButtonOverrides,
  never
>;

export const NavigationButton = (props: NavigationButtonProps) => {
  const { color, children, icon, href, disabled, ...rest } = useConfig('NavigationButton', props);

  const { router } = useFramework();
  const isTabletDown = useBreakpoint('tablet-down');

  const isActive = router.pathname === href;

  void color;

  return (
    <Link
      href={href}
      underline="none"
      className="RosenNavigationButton"
      data-active={isActive || undefined}
      data-tablet-down={isTabletDown || undefined}
      data-disabled={disabled || undefined}
      aria-disabled={disabled}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        router.push(href!);
      }}
      {...rest}
    >
      <span className="RosenNavigationButton-startIcon">
        <Icon color="inherit" name={icon} />
      </span>
      <span className="RosenNavigationButton-label">{children}</span>
    </Link>
  );
};

NavigationButton.displayName = 'NavigationButton';
