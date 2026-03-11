import { ComponentProps, CSSProperties, FC, SVGAttributes } from 'react';

import { ColorOverridden, OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';
import { toCSSColor, toCSSUnit } from '@/utils';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IconOverrides {}

export type IconOwnProps = {
  color?: ColorOverridden;
  icons?: Record<
    NonNullable<IconOverriddenProps['name']>,
    FC<SVGAttributes<SVGElement>>
  >;
  name?: string & {};
  size?: 'small' | 'medium' | 'large' | (number & {}) | (string & {});
};

export type IconBaseProps = ElementBaseProps<'svg', IconOwnProps>;

export type IconOverriddenProps = OverridableType<
  IconBaseProps,
  IconOverrides,
  'color' | 'name' | 'size'
>;

export const IconBase = ({
  color = 'inherit',
  icons,
  name,
  size = 'medium',
  ...rest
}: IconOverriddenProps) => {
  if (!icons || !name || !(name in icons)) return null;

  const Icon = icons[name];

  if (!Icon) {
    console.warn(`Icon '${name}' not found`);
  }

  const styles = {
    '--rosen-icon-color': toCSSColor(color),
    '--rosen-icon-size': toCSSUnit('icon-size', size),
  } as CSSProperties;

  return <Root as={Icon} style={styles} {...rest} />;
};

IconBase.displayName = 'Icon';

export const Icon = Wrap(IconBase);

export type IconProps = ComponentProps<typeof Icon>;
