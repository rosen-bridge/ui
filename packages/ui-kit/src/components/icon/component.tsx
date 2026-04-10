import { ComponentProps, FC, SVGAttributes, useMemo } from 'react';

import * as Icons from '@rosen-bridge/icons';

import { Skeleton } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { ColorOverridden, OverridableType } from '@/types';
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
  loading?: boolean;
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
  loading,
  name,
  size = 'medium',
  style,
  ...rest
}: IconOverriddenProps) => {
  const Icon =
    as ||
    icons?.[name as keyof typeof icons] ||
    icons?.[fallback as keyof typeof icons];

  const styles = useMemo(
    () => ({
      '--rosen-icon-color': toCSSColor(color),
      '--rosen-icon-size': toCSSUnit('icon-size', size),
      ...style,
    }),
    [color, size, style],
  );

  if (loading) {
    return (
      <Skeleton
        className="RosenIcon"
        height={toCSSUnit('icon-size', size)}
        width={toCSSUnit('icon-size', size)}
        variant="circular"
        style={style}
      />
    );
  }

  if (!Icon) {
    console.error(`Icon '${name}' not found`);
    return null;
  }

  return <Icon style={styles} {...rest} />;
};

IconBase.displayName = 'Icon';

export const Icon = Wrap(IconBase);

export type IconProps = ComponentProps<typeof Icon>;
