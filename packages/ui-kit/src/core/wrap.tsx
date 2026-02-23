/* eslint-disable */
import {
  ComponentType,
  CSSProperties,
  forwardRef,
  RefAttributes,
  useMemo,
} from 'react';

import { Breakpoint } from '@mui/material';

import { useCurrentBreakpoint } from '../hooks';
import { useConfigs } from '../Providers';

const breakpointOrder: Breakpoint[] = ['mobile', 'tablet', 'laptop', 'desktop'];

export type WrapProps<P> = {
  className?: string;
  rewrite?: Partial<Record<Breakpoint, Partial<P>>>;
  style?: CSSProperties;
} & P;

export const Wrap = <P extends object, R = unknown>(
  BaseComponent: ComponentType<P & RefAttributes<R>>,
  options?: {
    props?: {
      [K in keyof P]?: {
        parser?: 'color' | 'size';
        reflect?: boolean;
      };
    };
  },
) => {
  const prefix = 'rosen';

  const WrappedComponent = forwardRef<R, WrapProps<P>>(
    ({ className, rewrite, style, ...rest }, ref) => {
      const config = useConfigs();

      const current = useCurrentBreakpoint();

      const componentName = BaseComponent.displayName || BaseComponent.name;

      const mergedProps = useMemo(() => {
        if (!config) return rest as P;

        const globalDefaultProps =
          config.components?.[componentName as keyof typeof config.components]
            ?.defaultProps || {};

        const baseProps = { ...globalDefaultProps, ...rest } as P;

        if (!rewrite || !current) return baseProps;

        const currentIndex = breakpointOrder.indexOf(current);

        if (currentIndex === -1) return baseProps;

        const applied = Object.assign(
          {},
          ...breakpointOrder
            .slice(0, currentIndex + 1)
            .map((bp) => rewrite[bp] ?? {}),
        );

        return { ...baseProps, ...applied } as P;
      }, [config, componentName, current, rest, rewrite]);

      const optionKeys = useMemo(() => {
        return Object.keys(options?.props || {}) as Array<keyof P>;
      }, [mergedProps, options?.props]);

      const attrs = useMemo(() => {
        const result: Record<string, unknown> = {};

        for (const key of optionKeys) {
          const config = options?.props?.[key];

          if (!config?.reflect) continue;

          if (!(key in mergedProps)) continue;

          result[`data-${String(key)}`] = String(mergedProps[key]);
        }

        return result;
      }, [mergedProps, options?.props, optionKeys]);

      const classes = useMemo(() => {
        return [`${prefix}-${componentName}`, className]
          .filter(Boolean)
          .join(' ')
          .trim();
      }, [className, componentName]);

      const cssVariables = useMemo(() => {
        const result: Record<string, string> = {};

        for (const key of optionKeys) {
          if (!(key in mergedProps)) continue;

          const value = mergedProps[key];

          const parser = options?.props?.[key]?.parser;

          switch (parser) {
            case 'color': {
              const option = new Option();

              option.style.color = `${value}`;

              const isValid = option.style.color !== '';

              result[String(key)] = isValid
                ? (value as any)
                : `var(--${prefix}-palette-${value})`;

              break;
            }
            //   case 'size': {
            //     const option = new Option();

            //     option.style.width = `${value}`;

            //     const isValid = option.style.width !== '';

            //     if (typeof value === 'number') {
            //       result[key] = `calc(var(--${prefix}-spacing, 1px) * ${value})`;
            //     }
            //     else if(isValid) {
            //       result[key] = value;
            //     }
            //     else {
            //       result[key] = `var(--${prefix}-${componentName}-${key})`;
            //     }

            //     break;
            //   }
          }
        }

        return result;
      }, [mergedProps, optionKeys, options]);

      const styles = useMemo(() => {
        return Object.assign({}, cssVariables, style);
      }, [cssVariables, style]);

      return (
        <BaseComponent
          className={classes}
          ref={ref}
          style={styles}
          {...attrs}
          {...mergedProps}
        />
      );
    },
  );

  WrappedComponent.displayName = BaseComponent.displayName;

  return WrappedComponent;
};
