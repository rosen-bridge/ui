import { useContext } from 'react';

import { ConfigContext } from '@/Providers';

type WithClassName = {
  className?: string;
};

export const useConfig = <C extends string, P extends WithClassName>(
  componentName: C,
  props: P,
): P => {
  const config = useContext(ConfigContext);

  const baseClass = `Rosen${componentName}`;

  const className = props.className
    ? `${baseClass} ${props.className}`
    : baseClass;

  const global =
    config?.components?.[componentName as keyof typeof config.components]
      ?.defaultProps;

  return {
    ...global,
    ...props,
    className,
  };
};
