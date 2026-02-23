import { ComponentProps, FC, SVGAttributes } from 'react';

import { ColorOverridden, OverridableType } from '../../@types';
import { Wrap } from '../../core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IconOverrides {}

export type IconPropsBase = SVGAttributes<SVGElement> & {
  color?: ColorOverridden;
  icons?: Record<string, FC<SVGAttributes<SVGElement>>>;
  name?: string & {};
  size?: 'small' | 'medium' | 'large' | (number & {}) | (string & {});
};

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
  void color;
  void size;

  if (!icons || !name || !(name in icons)) return null;

  const Icon = icons[name];

  return <Icon {...rest} />;
};

IconBase.displayName = 'Icon';

export const Icon = Wrap(IconBase, {
  props: {
    color: {
      parser: 'color',
    },
    size: {
      parser: 'size',
    },
  },
});

export type IconProps = ComponentProps<typeof Icon>;
