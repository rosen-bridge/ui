import React, { useMemo } from 'react';

import { InjectOverrides } from './InjectOverrides';

export type SvgIconProp = React.SVGProps<SVGSVGElement> & {
  /** Control the main color of the icon */
  color?: string;
  /** If true, use the child SVG's original viewBox */
  inheritViewBox?: boolean;
  /** Horizontal size of the icon */
  size?: number | string;
  /** Override default viewBox of the icon */
  viewBox?: string;
};

/**
 * Base SVG Icon component
 */
const SvgIconBase = React.forwardRef<SVGSVGElement, SvgIconProp>(
  function SvgIcon(props, ref) {
    const {
      children,
      color,
      height,
      inheritViewBox = false,
      size = 24,
      style,
      viewBox = '0 0 24 24',
      width,
      ...rest
    } = props;

    const mergedStyle = useMemo(
      () =>
        Object.assign(
          {
            display: 'inline-block',
            verticalAlign: 'middle',
            width: width ?? size,
            height: height ?? size,
            fill: color,
          },
          style,
        ),
      [width, height, size, color, style],
    );

    return (
      <svg
        ref={ref}
        viewBox={inheritViewBox ? undefined : viewBox}
        style={mergedStyle}
        {...rest}
      >
        {children}
      </svg>
    );
  },
);

export const IconWrap = InjectOverrides(SvgIconBase);
