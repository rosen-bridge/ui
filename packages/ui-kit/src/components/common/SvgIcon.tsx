import { ComponentProps, forwardRef, SVGAttributes, useMemo } from 'react';

import { SvgIcon as MuiSvgIcon } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

import { Colors, ensureColor } from '../../core';
import { useTheme } from '../../hooks';
import { InjectOverrides } from './InjectOverrides';

const SIZE_PREDEFINED = ['inherit', 'small', 'medium', 'large'] as const;

type SizePredefined = (typeof SIZE_PREDEFINED)[number];

/**
 * Props for the SvgIcon component.
 * Extends native SVG attributes with design-system specific
 * color and size handling.
 */
type SvgIconPropsBase = SVGAttributes<SVGElement> & {
  /** Theme-aware color key or custom CSS color value. */
  color?: Colors;

  /**
   * Controls icon size.
   * Can be one of the predefined values (`inherit`, `small`, `medium`, `large`),
   * a number (uses theme.spacing), or a custom string (e.g., "24px").
   */
  size?: SizePredefined | (number & {}) | (string & {});
};

/**
 * SvgIcon component built on top of MUI's SvgIcon.
 * Supports theme-aware colors and flexible sizing.
 *
 * @example
 * <SvgIcon color="primary" size={24}>
 *   <path d="..." />
 * </SvgIcon>
 */
const SvgIconBase = forwardRef<SVGSVGElement, SvgIconPropsBase>(
  (props, ref) => {
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
      return { color: ensureColor(color), width, height: width };
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
  },
);

SvgIconBase.displayName = 'SvgIcon';

export const SvgIcon = InjectOverrides(SvgIconBase);

export type SvgIconProps = ComponentProps<typeof SvgIcon>;
