import {
  ComponentType,
  forwardRef,
  HTMLAttributes,
  RefAttributes,
  useMemo,
} from 'react';
import { Breakpoint } from '@mui/material';
import { useCurrentBreakpoint } from '../hooks';
import { kebabCase } from 'lodash-es';

const breakpointOrder: Breakpoint[] = ['mobile', 'tablet', 'laptop', 'desktop'];

export type WrapProps<P> = {
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
 * const ResponsiveButton = Wrap(Button);
 * <ResponsiveButton
 *   variant="contained"
 *   overrides={{ mobile: { size: "small" }, laptop: { size: "large" } }}
 * />
 */
export const Wrap = <P extends object, R = unknown>(
  BaseComponent: ComponentType<P & RefAttributes<R>>,
  options?: {
    reflects?: Array<
      Exclude<keyof P, keyof HTMLAttributes<HTMLElement> | 'key' | 'ref'>
    >;
  }
) => {
  const WrappedComponent = forwardRef<R, WrapProps<P>>(
    ({ overrides, ...rest }, ref) => {
      const current = useCurrentBreakpoint();

      const mergedProps = useMemo(() => {
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

      const className = useMemo(() => {
        if (!options?.reflects) return (rest as any).className;

        const componentName = kebabCase(BaseComponent.displayName);

        const reflectClasses = options.reflects
          .map((key) => {
            const value = mergedProps[key];
            if (value === undefined || value === null || value === false) return null;
            return `${componentName}-${String(key)}-${String(value)}`;
          })
          .filter(Boolean)
          .join(' ');

        return [
          componentName,
          (rest as any).className || '',
          reflectClasses,
        ]
          .filter(Boolean)
          .join(' ')
          .trim();
      }, [mergedProps, rest]);

      return <BaseComponent {...mergedProps} className={className} ref={ref} />;
    },
  );

  WrappedComponent.displayName = BaseComponent.displayName;

  return WrappedComponent;
};
