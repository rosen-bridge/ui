import React, { forwardRef, HTMLAttributes } from 'react';

import { Box } from '../../base';

/**
 * Props for the `Card2` component.
 */
type Card2Props = {
  /**
   * If `true`, the card will show a pointer cursor on hover,
   * indicating it is clickable.
   *
   * @default false
   */
  clickable?: boolean;

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
   * Visual variant of the card. Currently supports only `'separated'`.
   */
  variant?: 'separated';
} & HTMLAttributes<HTMLDivElement>;

/**
 * `Card2` is a reusable UI component based on MUI's `Box`.
 * It supports optional clickable behavior, active state styling,
 * customizable background color, and variants.
 *
 * @example
 * ```tsx
 * <Card2 clickable active backgroundColor="#f0f0f0" variant="separated">
 *   Content here
 * </Card2>
 * ```
 */
export const Card2 = forwardRef<HTMLDivElement, Card2Props>(function Card2(
  { clickable, active, backgroundColor = 'white', children, variant, ...rest },
  ref,
) {
  return (
    <Box
      ref={ref}
      className={`card2 ${variant ? 'card2-' + variant : ''}`}
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
