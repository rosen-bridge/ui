import {
  ComponentProps,
  CSSProperties,
  FC,
  SVGAttributes,
  useMemo,
} from 'react';

import * as Icons from '@rosen-bridge/icons';

import { ColorOverridden, OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';
import { toCSSColor, toCSSUnit } from '@/utils';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IconOverrides {}

export type IconOwnProps = {
  as?: FC<SVGAttributes<SVGElement>>;
  color?: ColorOverridden;
  fallback?: Exclude<keyof typeof Icons, 'TOKENS'>;
  icons?: Record<
    NonNullable<IconOverriddenProps['name']>,
    FC<SVGAttributes<SVGElement>>
  >;
  name?: Exclude<keyof typeof Icons, 'TOKENS'>;
  size?: 'small' | 'medium' | 'large' | (number & {}) | (string & {});
};

export type IconBaseProps = ElementBaseProps<'svg', IconOwnProps>;

export type IconOverriddenProps = OverridableType<
  IconBaseProps,
  IconOverrides,
  'color' | 'name' | 'size'
>;

export const IconBase = ({
  as,
  color = 'inherit',
  fallback,
  icons,
  name,
  size = 'medium',
  ...rest
}: IconOverriddenProps) => {
  const Icon =
    as ||
    icons?.[name as keyof typeof icons] ||
    icons?.[fallback as keyof typeof icons];

  if (!Icon) {
    console.error(`Icon '${name}' not found`);
  }

  const styles = useMemo(
    () =>
      ({
        '--rosen-icon-color': toCSSColor(color),
        '--rosen-icon-size': toCSSUnit('icon-size', size),
      }) as CSSProperties,
    [color, size],
  );

  return <Root as={Icon} styles={styles} {...rest} />;
};

IconBase.displayName = 'Icon';

export const Icon = Wrap(IconBase);

export type IconProps = ComponentProps<typeof Icon>;
