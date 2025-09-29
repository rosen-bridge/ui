import { ComponentProps, forwardRef, SVGAttributes, useMemo } from 'react';

import { SvgIcon as MuiSvgIcon } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

import { Colors, Wrap } from '../core';
import { useTheme } from '../hooks';

const SIZE_PREDEFINED = ['inherit', 'small', 'medium', 'large'] as const;

type SizePredefined = typeof SIZE_PREDEFINED[number];

/**
 * TODO
 */
type SvgIcon2PropsBase = SVGAttributes<SVGElement> & {
  color?: Colors;
  size?: SizePredefined | (number & {}) | (string & {});
};

/**
 * TODO
 */
const SvgIcon2Base = forwardRef<SVGSVGElement, SvgIcon2PropsBase>((props, ref) => {
  const {
    children,
    color = 'inherit',
    shapeRendering,
    size = 'medium',
    ...rest
  } = props;

  const theme = useTheme();

  const isPredefined = useMemo(() => {
    return (SIZE_PREDEFINED as readonly string[]).includes(size as string);
  }, [size]);

  const fontSize = useMemo(() => {
    return isPredefined ? (size as SizePredefined) : undefined;
  }, [isPredefined, size]);

  const width = useMemo(() => {
    if (isPredefined) return;

    if (typeof size === 'string') return size;

    return theme.spacing(size);
  }, [isPredefined, size, theme]);

  const sx = useMemo<SxProps<Theme>>(() => {
    return { color, width, height: width };
  }, [color, width]);

  return (
    <MuiSvgIcon
      {...rest}
      fontSize={fontSize}
      ref={ref}
      shapeRendering={shapeRendering as string}
      sx={sx}
    >
      {children}
    </MuiSvgIcon>
  );
});

SvgIcon2Base.displayName = 'SvgIcon2';

export const SvgIcon2 = Wrap(SvgIcon2Base);

export type SvgIcon2Props = ComponentProps<typeof SvgIcon2>;
