import { ComponentProps, forwardRef, SVGAttributes, useMemo } from 'react';

import { SvgIcon } from '@mui/material';

import { Colors, Wrap } from '../core';
import { useTheme } from '../hooks';

/**
 * TODO
 */
type SvgIcon2PropsBase = SVGAttributes<SVGElement> & {
  color?: Colors;
  size?: 'inherit' | 'small' | 'medium' | 'large' | (number & {}) | (string & {});
};

/**
 * TODO
 */
const SvgIcon2Base = forwardRef<SVGElement, SvgIcon2PropsBase>((props, ref) => {
  const {
    children,
    color = 'inherit',
    size = 'medium',
    ...rest
  } = props;

  const theme = useTheme();

  const isPredefined = useMemo(() => {
    return ['inherit', 'small', 'medium', 'large'].includes(size)
  }, [size]);

  const fontSize = useMemo(() => {
    return isPredefined ? size : undefined;
  }, [isPredefined, size]);

  const width = useMemo(() => {
    if (isPredefined) return;

    if (typeof size === 'string') return size;

    return theme.spacing(size);
  }, [isPredefined, size, theme]);

  const sx = useMemo(() => {
    return { color, width: width, height: width }
  }, [color, width]);

  return <SvgIcon {...rest} fontSize={fontSize} sx={sx} ref={ref}>
    {children}
  </SvgIcon>
});

SvgIcon2Base.displayName = "SvgIcon2";

export const SvgIcon2 = Wrap(SvgIcon2Base);

export type SvgIcon2Props = ComponentProps<typeof SvgIcon2>;


