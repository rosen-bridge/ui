import { ComponentProps, forwardRef, HTMLAttributes } from 'react';

import * as Icons from '@rosen-bridge/icons';

import { Wrap } from '../core';

/**
 * TODO
 */
type IconPropsBase = HTMLAttributes<HTMLDivElement> & {
  color?: string;
  name?: keyof typeof Icons;
  size?: number | string;
};

/**
 * TODO
 */
const IconBase = forwardRef<HTMLDivElement, IconPropsBase>((props, ref) => {
  const {
    children,
    color,
    name,
    size,
    ...rest
  } = props;

  void children; void color; void size;

  if (!name || !(name in Icons)) return null;

  const Svg = Icons[name];

  return <Svg {...rest} ref={ref} />
});

IconBase.displayName = "Icon";

export const Icon = Wrap(IconBase, {
  reflects: [
    {
      property: 'color' as any,
      parser: 'COLOR'
    },
    {
      property: 'size',
      parser: 'SIZE'
    }
  ]
});

export type IconProps = ComponentProps<typeof Icon>;


