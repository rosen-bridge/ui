import { useContext } from 'react';

import { ConfigContext } from '@/providers';

type WithClassName = {
  className?: string;
  preset?: string;
};

export const useConfig = <C extends string, P extends WithClassName>(
  componentName: C,
  props: P,
): P => {
  const { className, preset, ...inlineProps } = props;

  const configs = useContext(ConfigContext);

  /**
   * TODO: remove the inline Biome comment
   * local:ergo/rosen-bridge/ui#441
   */
  // biome-ignore lint/suspicious/noExplicitAny: Use a better type
  const config = configs?.components?.[componentName as keyof typeof configs.components] as any;

  const classes = className ? `Rosen${componentName} ${className}` : `Rosen${componentName}`;

  const defaultProps = config?.defaultProps;

  const presetProps = config?.presets?.[preset || defaultProps?.preset];

  const result = { ...defaultProps, ...presetProps, ...inlineProps, className: classes };

  if (result.preset) {
    result['data-preset'] = result.preset;
  }

  return result;
};
