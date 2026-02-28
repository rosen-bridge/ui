import { ComponentProps, FC, SVGAttributes } from 'react';

import { ColorOverridden, OverridableType } from '../../@types';
import { ElementPropsBase, Root, Wrap } from '../../core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IconOverrides {}

export type IconPropsBase = {
  color?: ColorOverridden;
  icons?: Record<string, FC<SVGAttributes<SVGElement>>>;
  name?: string & {};
  size?: 'small' | 'medium' | 'large' | (number & {}) | (string & {});
} & ElementPropsBase<'svg'>;

export type IconPropsBaseOverridden = OverridableType<
  IconPropsBase,
  IconOverrides,
  'color' | 'name' | 'size'
>;

export const IconBase = ({
  color = 'inherit',
  icons,
  name,
  size = 'medium',
  ...rest
}: IconPropsBaseOverridden) => {
  if (!icons || !name || !(name in icons)) return null;

  const Icon = icons[name];

  if (!Icon) {
    console.warn(`Icon '${name}' not found`);
  };

  // TODO: parser for color and size

  return <Root reflects={{ color, size }} {...rest} as={Icon} />;
};

IconBase.displayName = 'Icon';

export const Icon = Wrap(IconBase);

export type IconProps = ComponentProps<typeof Icon>;
