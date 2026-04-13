import {
  ComponentPropsWithRef,
  ComponentType,
  ElementType,
  useMemo,
} from 'react';

import { useConfig } from '@/configuration';
import { useCurrentBreakpoint } from '@/hooks';
import { Breakpoint } from '@/types';

const BREAKPOINT_ORDER: Breakpoint[] = [
  'mobile',
  'tablet',
  'laptop',
  'desktop',
];

export type ElementBaseProps<E extends ElementType, P> = P & Omit<ComponentPropsWithRef<E>, keyof P> & {
  rewrite?: Partial<Record<Breakpoint, Partial<P>>>;
};

export type WrapProps<P> = {
  className?: string;
  rewrite?: Partial<Record<Breakpoint, Partial<P>>>;
} & P;

export const Wrap = <P,>(Base: ComponentType<P>) => {
  const componentName = Base.displayName || Base.name;

  const Wrapped = (props: WrapProps<P>) => {
    const { className, rewrite, ...rest } = props;

    const config = useConfig();

    const current = useCurrentBreakpoint();

    const classes = useMemo(() => {
      const base = 'Rosen' + componentName;

      if (!className) return base;

      return base + ' ' + className;
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

    return <Base className={classes} {...mergedProps} />;
  };

  Wrapped.displayName = componentName;

  return Wrapped;
};
