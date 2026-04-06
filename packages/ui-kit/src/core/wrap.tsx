import {
  ComponentPropsWithRef,
  ComponentType,
  ElementType,
  useMemo,
} from 'react';

import { Breakpoint } from '@mui/material';

import { useConfig } from '@/configuration';
import { useBreakpoint, useCurrentBreakpoint } from '@/hooks';

const BREAKPOINT_ORDER: Breakpoint[] = [
  'mobile',
  'tablet',
  'laptop',
  'desktop',
];

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
  const componentName = Base.displayName || Base.name;

  const Wrapped = (props: WrapProps<P>) => {
    const { className, rewrite, skip, ...rest } = props;

    const breakpoint = useBreakpoint(
      !skip ? 'mobile-up' : skip === true ? 'mobile-down' : skip,
    );

    const config = useConfig();

    const current = useCurrentBreakpoint();

    const isSkipped =
      skip === true || (typeof skip === 'string' ? breakpoint : false);

    const classes = useMemo(() => {
      return [`Rosen${componentName}`, className]
        .filter(Boolean)
        .join(' ')
        .trim();
    }, [className, componentName]);

    const mergedProps = useMemo(() => {
      if (!config) return rest;

      const globalDefaultProps =
        config.components?.[componentName as keyof typeof config.components]
          ?.defaultProps;

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
