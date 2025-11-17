import { ComponentType, forwardRef, RefAttributes, useMemo } from 'react';

import { Breakpoint } from '@mui/material';

import { useCurrentBreakpoint } from '../../hooks';

const breakpointOrder: Breakpoint[] = ['mobile', 'tablet', 'laptop', 'desktop'];

export type InjectOverridesProps<P> = {
  /**
   * Optional overrides for component props based on current breakpoint.
   * Merged in order: mobile → tablet → laptop → desktop.
   *
   * Example:
   * <MyComponent someProp="default" overrides={{ mobile: { someProp: "small" }, laptop: { someProp: "large" } }} />
   * On laptop, someProp will be "large".
   */
  overrides?: Partial<Record<Breakpoint, Partial<P>>>;
} & P;

/**
 * HOC to enable responsive prop overrides for a component.
 * Props can be customized per breakpoint using overrides.
 *
 * @typeParam P - Props type of the wrapped component.
 *
 * @param BaseComponent - Component to wrap with responsive overrides.
 * @returns Component with all original props + overrides for breakpoints.
 *
 * @example
 * const ResponsiveButton = InjectOverrides(Button);
 * <ResponsiveButton
 *   variant="contained"
 *   overrides={{ mobile: { size: "small" }, laptop: { size: "large" } }}
 * />
 */
export const InjectOverrides = <P extends object, R = unknown>(
  BaseComponent: ComponentType<P & RefAttributes<R>>,
) => {
  const WrappedComponent = forwardRef<R, InjectOverridesProps<P>>(
    ({ overrides, ...rest }, ref) => {
      const current = useCurrentBreakpoint();

      const final = useMemo(() => {
        if (!overrides || !current) return { ...rest } as P;

        const currentIndex = breakpointOrder.indexOf(current);

        const applied: Partial<P> = Object.assign(
          {},
          ...breakpointOrder
            .slice(0, currentIndex + 1)
            .map((bp) => overrides[bp] ?? {}),
        );

        return { ...rest, ...applied } as P;
      }, [overrides, current, rest]);

      return <BaseComponent {...final} ref={ref} />;
    },
  );

  /**
   * Custom display name for React DevTools
   */
  WrappedComponent.displayName = `Overridable(
    ${BaseComponent.displayName || BaseComponent.name || 'Component'}
  )`;

  return WrappedComponent;
};
