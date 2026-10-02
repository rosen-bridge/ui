import type { ComponentProps, FunctionComponent } from 'react';

/** Public type of generated SVGR icons, including optional accessible SVG labels. */
export type SVGIcon = FunctionComponent<
  ComponentProps<'svg'> & {
    title?: string;
    titleId?: string;
    desc?: string;
    descId?: string;
  }
>;
