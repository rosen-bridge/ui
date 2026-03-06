import {
  ComponentPropsWithRef,
  ComponentType,
  CSSProperties,
  ElementType,
  useMemo,
} from 'react';

import { Breakpoint } from '@mui/material';

import { useBreakpoint, useCurrentBreakpoint } from '../hooks';
import { useConfigs } from '../Providers';

const BREAKPOINT_ORDER: Breakpoint[] = [
  'mobile',
  'tablet',
  'laptop',
  'desktop',
];

const PREFIX = 'rosen';

export type ElementBaseProps<E extends ElementType, P> = P &
  Omit<ComponentPropsWithRef<E>, keyof P>;

export type WrapProps<P> = {
  className?: string;
  skip?:
    | boolean
    | Breakpoint
    | `${Breakpoint}-${'up' | 'down' | 'not'}`
    | `${Breakpoint}-to-${Breakpoint}`;
  rewrite?: Partial<Record<Breakpoint, Partial<P>>>;
} & P;

export const Wrap = <P,>(Base: ComponentType<P>) => {
  const componentName = Base.displayName || Base.name || 'Wrap';

  const Wrapped = ({ className, rewrite, skip, ...rest }: WrapProps<P>) => {
    const breakpoint = useBreakpoint(
      !skip ? 'mobile-up' : skip === true ? 'mobile-down' : skip,
    );

    const config = useConfigs();

    const current = useCurrentBreakpoint();

    const isSkipped =
      skip === true || (typeof skip === 'string' ? breakpoint : false);

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
        ...BREAKPOINT_ORDER.slice(0, currentIndex + 1).map(
          (bp) => rewrite[bp] ?? {},
        ),
      );

      return { ...baseProps, ...applied };
    }, [config, componentName, current, rest, rewrite]);

    if (isSkipped) return null;

    return <Base className={classes} {...mergedProps} />;
  };

  Wrapped.displayName = componentName;

  return Wrapped;
};

export type RootProps<E extends ElementType> = ElementBaseProps<
  E,
  {
    as?: E;
    reflects?: Record<string, boolean | number | string | undefined>;
    style?: CSSProperties;
    styles?: CSSProperties;
  }
>;

export const Root = <E extends ElementType = 'div'>({
  as,
  reflects,
  style,
  styles,
  ...rest
}: RootProps<E>) => {
  const Component = (as || 'div') as ElementType;

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

  const mergedStyles = useMemo(
    () => Object.assign({}, styles, style),
    [styles, style],
  );

  return <Component {...reflected} style={mergedStyles} {...rest} />;
};
