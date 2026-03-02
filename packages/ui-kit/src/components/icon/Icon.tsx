import { ComponentProps, FC, SVGAttributes } from 'react';

import { ColorOverridden, OverridableType } from '../../@types';
import { ElementBaseProps, Root, Wrap } from '../../core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IconOverrides {}

export type IconOwnProps = {
  color?: ColorOverridden;
  icons?: Record<string, FC<SVGAttributes<SVGElement>>>;
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
  };

  // TODO: parser for color and size

  return <Root as={Icon} reflects={{ color, size }} {...rest} />;
};

IconBase.displayName = 'Icon';

export const Icon = Wrap(IconBase);

export type IconProps = ComponentProps<typeof Icon>;
