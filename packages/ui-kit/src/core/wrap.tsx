/* eslint-disable */

import {
  ComponentPropsWithoutRef,
  ComponentType,
  CSSProperties,
  ElementType,
  forwardRef,
  useMemo,
} from 'react';

import { Breakpoint } from '@mui/material';

import { useBreakpoint, useCurrentBreakpoint } from '../hooks';
import { useConfigs } from '../Providers';

const BREAKPOINT_ORDER: Breakpoint[] = ['mobile', 'tablet', 'laptop', 'desktop'];

const PREFIX = 'rosen';

export type ElementPropsBase<E extends ElementType> = {
  as?: E;
} & ComponentPropsWithoutRef<E>;

export type WrapProps<P> = {
  className?: string;
  skip?: boolean | Breakpoint | `${Breakpoint}-${'up' | 'down' | 'not'}` | `${Breakpoint}-to-${Breakpoint}`;
  rewrite?: Partial<Record<Breakpoint, Partial<P>>>;
} & P;

export const Wrap = <E extends ElementType, P extends ElementPropsBase<E>>(BaseComponent: ComponentType<P>) => {
  const componentName = BaseComponent.displayName || BaseComponent.name || 'Wrap';

  const WrappedComponent = forwardRef<any, WrapProps<any>>((props, ref) => {
    const { className, rewrite, skip, ...rest } = props;

    const config = useConfigs();

    const current = useCurrentBreakpoint();

    const matchesSkippedBreakpoint = typeof skip === 'string' ? useBreakpoint(skip as any) : false;

    const isSkipped = skip === true || matchesSkippedBreakpoint;

    const classes = useMemo(() => {
      return [`${PREFIX}-${componentName}`, className]
        .filter(Boolean)
        .join(' ')
        .trim();
    }, [className, componentName]);

    const mergedProps = useMemo(() => {
      if (!config) return rest;

      const globalDefaultProps =
        config.components?.[componentName as keyof typeof config.components]
          ?.defaultProps || {};

      const baseProps = { ...globalDefaultProps, ...rest };

      if (!rewrite || !current) return baseProps;

      const currentIndex = BREAKPOINT_ORDER.indexOf(current);

      if (currentIndex === -1) return baseProps;

      const applied = Object.assign(
        {},
        ...BREAKPOINT_ORDER
          .slice(0, currentIndex + 1)
          .map((bp) => rewrite[bp] ?? {}),
      );

      return { ...baseProps, ...applied };
    }, [config, componentName, current, rest, rewrite]);

    if (isSkipped) return null;

    return (
      <BaseComponent
        className={classes}
        ref={ref}
        {...mergedProps}
      />
    );
  });

  WrappedComponent.displayName = componentName;

  return WrappedComponent;
}

export type RootProps<E extends ElementType> = {
  cssColorVars?: Record<string, string>;
  reflects?: Record<string, boolean | number | string | undefined>;
  styles?: CSSProperties;
} & ElementPropsBase<E>;

export const Root = <E extends ElementType>(props: RootProps<E>) => {
  const {
    as,
    cssColorVars,
    cssSizeVars,
    reflects,
    style,
    styles,
    ...rest
  } = props;
  const Component = (as || 'div') as ElementType;

  const colors = Object.entries(cssSizeVars || {})
    .reduce((result, [key, value]) => {
      const option = new Option();

      option.style.color = `${value}`;

      const isValid = option.style.color !== '';

      result[`--${PREFIX}-${key}`] = isValid
        ? `${value}`
        : `var(--${PREFIX}-palette-${value})`;

      return result;
    }, {} as Record<string, string>);

  const reflected = useMemo(() => {
    if (!reflects) return {};

    const result: Record<string, string> = {};

    for (const key in reflects) {
      const value = reflects[key];
      if (value === undefined) continue;
      result[`data-${key}`] = String(value);
    }

    return result;
  }, [reflects]);

  const mergedStyles = useMemo(() => Object.assign({}, colors, styles, style), [colors, styles, style]);

  return <Component {...reflected} style={mergedStyles} {...rest} />
}
