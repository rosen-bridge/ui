import React, { forwardRef, HTMLAttributes } from 'react';

import { Box } from '../../base';
import { InjectOverrides } from '../InjectOverrides';

/**
 * Props for the `Card` component.
 */
export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * If `true`, the card will show an outline indicating it is active.
   *
   * @default false
   */
  active?: boolean;
  /**
   * Background color of the card.
   *
   * Can be any valid CSS color string.
   *
   * @default "white"
   */
  backgroundColor?: string;
  /**
   * If `true`, the card will show a pointer cursor on hover,
   * indicating it is clickable.
   *
   * @default false
   */
  clickable?: boolean;
  /**
   * If `true`, the card will be displayed with separated style.
   *
   * @default false
   */
  separated?: boolean;

  /**
   * Visual variant of the card. Supports `'default' | 'section'`.
   *
   * @default 'default'
   */
  variant?: 'default' | 'section';
};

/**
 * `Card` is a reusable UI component based on MUI's `Box`.
 * It supports optional clickable behavior, active state styling,
 * customizable background color, and variants.
 *
 * @example
 * ```tsx
 * <Card clickable active backgroundColor="#f0f0f0" separated variant="section">
 *   Content here
 * </Card>
 * ```
 *
 * default || section
 */
const CardBase = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    active,
    backgroundColor = 'white',
    clickable,
    children,
    separated,
    variant = 'default',
    ...rest
  },
  ref,
) {
  return (
    <Box
      ref={ref}
      className={`card2 card2-${variant} ${separated ? 'card2-separated' : ''}`}
      sx={{
        backgroundColor: backgroundColor,
        borderRadius: (theme) => theme.spacing(2),
        ...(clickable && { cursor: 'pointer' }),
        position: 'relative',
        ...(active && {
          outline: (theme) => `3px solid ${theme.palette.primary.main}`,
        }),
      }}
      {...rest}
    >
      {children}
    </Box>
  );
});

export const Card = InjectOverrides(CardBase);
