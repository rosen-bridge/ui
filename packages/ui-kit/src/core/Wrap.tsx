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
    reflects?: Array<{
      property: Exclude<keyof P, keyof HTMLAttributes<HTMLElement> | 'key' | 'ref'>,
      parser?: 'COLOR' | 'SIZE'
    }>;
  }
) => {
  const componentName = 'rosen-' + kebabCase(BaseComponent.displayName);

  const WrappedComponent = forwardRef<R, WrapProps<P>>(
    ({ overrides, ...rest }, ref) => {
      const current = useCurrentBreakpoint();

      const reflects = useMemo(() => options?.reflects || [], []);

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

      const attrs = useMemo(() => {
        const attr = {} as any;

        for (const reflect of reflects) {
          if (reflect.property in mergedProps) {
            attr[`data-${kebabCase(String(reflect.property))}`] = mergedProps[reflect.property];
          }
        }

        return attr
      }, [mergedProps, reflects]);

      const classes = useMemo(() => {
        return [componentName, (rest as any)?.className || ''].filter(Boolean).join(' ').trim();
      }, [rest]);

      const styles = useMemo(() => {
        const vars = {} as any;

        for (const reflect of reflects) {
          if (reflect.property in mergedProps) {
            switch (reflect.parser) {
              case 'COLOR': {
                const value = mergedProps[reflect.property];

                const option = new Option();

                (option as any).style.color = value;

                if (option.style.color !== '') {
                  vars[`--${componentName}-${kebabCase(String(reflect.property))}`] = value;
                }

                break;
              }
              case 'SIZE': {
                const value = mergedProps[reflect.property];
                if (value === undefined || value === null || value === '') {
                  break;
                }
                if (typeof value === 'number') {
                  vars[`--${componentName}-${kebabCase(String(reflect.property))}-scale`] = value;
                }
                if (/^\d+(\.\d+)?(px|pt|cm|mm|in|em|rem|%|vw|vh)$/.test(value as string)) {
                  vars[`--${componentName}-${kebabCase(String(reflect.property))}`] = value;
                }
                break;
              }
            }
          }
        }

        return Object.assign({}, vars, (rest as any).style)
      }, [mergedProps, reflects, rest])

      return <BaseComponent {...mergedProps} className={classes} style={styles} ref={ref} {...attrs} />;
    },
  );

  WrappedComponent.displayName = BaseComponent.displayName;

  return WrappedComponent;
};
