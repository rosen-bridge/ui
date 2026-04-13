import { ComponentPropsWithRef, ElementType, useMemo } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { Color, OverridableType } from '@/types';
import { toCSSColor } from '@/utils';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LinkOverrides {}

export type LinkOwnProps = {
  as?: ElementType<ComponentPropsWithRef<'a'>>;
  color?: Color;
  underline?: 'always' | 'hover' | 'none';
};

export type LinkBaseProps = ElementBaseProps<'a', LinkOwnProps>;

export type LinkProps = OverridableType<
  LinkBaseProps,
  LinkOverrides,
  'color' | 'href'
>;

export const LinkBase = ({
  as: Component = 'a',
  color,
  style,
  underline = 'always',
  ...rest
}: LinkProps) => {
  const styles = useMemo(
    () => ({
      color: toCSSColor(color),
      ...style,
    }),
    [color, style],
  );

  return <Component data-underline={underline} style={styles} {...rest} />;
};

LinkBase.displayName = 'Link';

export const Link = Wrap(LinkBase);
