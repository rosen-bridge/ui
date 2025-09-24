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
import { useConfigs } from './ConfigProvider';

const breakpointOrder: Breakpoint[] = ['mobile', 'tablet', 'laptop', 'desktop'];

export type WrapProps<P> = {
  overrides?: Partial<Record<Breakpoint, Partial<P>>>;
} & P;

export const Wrap = <P extends object, R = unknown>(
  BaseComponent: ComponentType<P & RefAttributes<R>>,
  options?: {
    reflects?: Array<{
      property: Exclude<keyof P, keyof HTMLAttributes<HTMLElement> | 'key' | 'ref'>,
      parser?: 'COLOR' | 'SIZE'
    }>;
  }
) => {
  const prefix = 'rosen';

  const componentName = prefix + '-' + kebabCase(BaseComponent.displayName);

  const WrappedComponent = forwardRef<R, WrapProps<P>>(
    ({ overrides, ...rest }, ref) => {
      const config = useConfigs();

      const current = useCurrentBreakpoint();

      const globalProps = useMemo(() => {
        return config.components?.[BaseComponent.displayName as keyof typeof config.components]?.defaultProps || {}
      }, [config]);

      const reflects = useMemo(() => options?.reflects || [], []);

      const mergedProps = useMemo(() => {
        if (!overrides || !current) return { ...globalProps, ...rest } as P;

        const currentIndex = breakpointOrder.indexOf(current);

        const applied: Partial<P> = Object.assign(
          {},
          ...breakpointOrder
            .slice(0, currentIndex + 1)
            .map((bp) => overrides[bp] ?? {}),
        );

        return { ...globalProps, ...rest, ...applied } as P;
      }, [globalProps, overrides, current, rest]);

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

                if (value === undefined || value === null || value === '') break;

                const option = new Option();

                (option as any).style.color = value;

                if (option.style.color !== '') {
                  vars[`--${componentName}-${kebabCase(String(reflect.property))}`] = value;
                } else {
                  vars[`--${componentName}-${kebabCase(String(reflect.property))}`] = `var(--rosen-palette-${value})`;
                }

                break;
              }
              case 'SIZE': {
                const value = mergedProps[reflect.property];
                if (value === undefined || value === null || value === '') {
                  break;
                }
                if (typeof value === 'number') {
                  vars[`--${componentName}-${kebabCase(String(reflect.property))}`] = `calc(var(--rosen-spacing) * ${value} * 1px)`;
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
