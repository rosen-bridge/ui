import React from 'react';

import { Breakpoint } from '@mui/material';

import { useCurrentBreakpoint } from '../../hooks';

const breakpointOrder: Breakpoint[] = ['mobile', 'tablet', 'laptop', 'desktop'];

export type InjectOverridesProps<P> = {
  /**
   * Optional overrides for props based on the current breakpoint.
   *
   * You can provide partial props for one or multiple breakpoints.
   * The final props passed to the component will be a merge of:
   * - The base props
   * - All overrides for breakpoints up to and including the current one
   *
   * Example:
   * ```tsx
   * <MyResponsiveComponent
   *   someProp="default"
   *   overrides={{
   *     mobile: { someProp: "small" },
   *     laptop: { someProp: "large" }
   *   }}
   * />
   * ```
   *
   * If the current breakpoint is `"laptop"`, the value of `someProp` will be `"large"`.
   */
  overrides?: Partial<Record<Breakpoint, Partial<P>>>;
} & P;

/**
 * Higher-order component (HOC) that allows props of a given component
 * to be overridden based on the current responsive breakpoint.
 *
 * The current breakpoint is determined using `useCurrentBreakpoint`.
 * Overrides are merged in order of breakpoints (`mobile` → `tablet` → `laptop` → `desktop`).
 *
 * @typeParam P - The props type of the wrapped component.
 *
 * @param BaseComponent - The component to wrap with responsive overrides.
 *
 * @returns A new component that accepts all props of `BaseComponent`
 * plus an `overrides` prop for responsive customization.
 *
 * @example
 * ```tsx
 * const ResponsiveButton = OverridableComponent(Button);
 *
 * <ResponsiveButton
 *   variant="contained"
 *   overrides={{
 *     mobile: { size: "small" },
 *     laptop: { size: "large" },
 *   }}
 * >
 *   Click Me
 * </ResponsiveButton>
 * ```
 *
 * In this example, the button will be small on mobile devices and large on laptops,
 * while using the base props (`variant="contained"`) everywhere.
 */
export const InjectOverrides = <P extends object>(
  BaseComponent: React.ComponentType<P>,
): React.FC<InjectOverridesProps<P>> => {
  const WrappedComponent: React.FC<InjectOverridesProps<P>> = ({
    overrides,
    ...rest
  }) => {
    const current = useCurrentBreakpoint();

    const final = React.useMemo(() => {
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

    return <BaseComponent {...final} />;
  };

  /**
   * Custom display name for React DevTools
   */
  WrappedComponent.displayName = `Overridable(${BaseComponent.displayName || BaseComponent.name || 'Component'})`;

  return WrappedComponent;
};
