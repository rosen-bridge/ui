import {
  ComponentPropsWithRef,
  ComponentType,
  ElementType,
  useMemo,
} from 'react';

import { useConfig } from '@/configuration';

export type ElementBaseProps<E extends ElementType, P> = P & Omit<ComponentPropsWithRef<E>, keyof P>;

export type WrapProps<P> = { className?: string; } & P;   

export const Wrap = <P,>(Base: ComponentType<P>) => {
  const componentName = Base.displayName || Base.name;

  const Wrapped = (props: WrapProps<P>) => {
    const { className, ...rest } = props;

    const config = useConfig();

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

      return { ...globalDefaultProps, ...rest };
    }, [config, componentName, rest]);

    return <Base className={classes} {...mergedProps} />;
  };

  Wrapped.displayName = componentName;

  return Wrapped;
};
