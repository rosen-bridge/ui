import { useMemo } from 'react';

import { useConfig } from '@/hooks';
import type { Color, ElementBaseProps, OverridableType } from '@/types';
import { toCSSColor } from '@/utils';

import './styles.css';

export interface LinkOverrides {}

export type LinkOwnProps = {
  // biome-ignore lint/suspicious/noExplicitAny: Use a better type
  as?: any;
  color?: Color;
  underline?: 'always' | 'hover' | 'none';
};

export type LinkBaseProps = ElementBaseProps<'a', LinkOwnProps>;

export type LinkProps = OverridableType<
  LinkBaseProps,
  LinkOverrides,
  'color' | 'href'
>;

export const Link = (props: LinkProps) => {
  const {
    as: Component = 'a',
    color,
    style,
    underline = 'always',
    ...rest
  } = useConfig('Link', props);

  const styles = useMemo(
    () => ({
      color: toCSSColor(color),
      ...style,
    }),
    [color, style],
  );

  return <Component data-underline={underline} style={styles} {...rest} />;
};

Link.displayName = 'Link';
