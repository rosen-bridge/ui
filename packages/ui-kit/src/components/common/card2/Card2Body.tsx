import React, { HTMLAttributes } from 'react';

import { Box } from '../../base';

/**
 * Props for the `Card2Body` component.
 *
 * Extends standard HTML `<div>` attributes.
 */
type Card2BodyProps = {} & HTMLAttributes<HTMLDivElement>;

/**
 * `Card2Body` is a content container used within a `Card2` component.
 * It provides consistent padding and spacing rules depending on
 * the card variant and its neighboring elements (e.g., `Card2Header`).
 *
 * This component applies conditional padding styles:
 * - Removes top padding if it follows a `card2-header` inside a non-separated card.
 * - Removes bottom padding if it's immediately followed by another `card2-header`.
 *
 * @example
 * ```tsx
 * <Card2>
 *   <Card2Header>Header</Card2Header>
 *   <Card2Body>
 *     <Typography>Content goes here</Typography>
 *   </Card2Body>
 * </Card2>
 * ```
 */
export const Card2Body = ({ children, style, ...rest }: Card2BodyProps) => {
  return (
    <Box
      className="card2-body"
      sx={{
        'padding': (theme) => theme.spacing(2),
        ...(style || {}),
        '.card2:not(.card2-separated) > .card2-header + &': {
          paddingTop: 0,
        },
        '&:has(+ .card2-header)': {
          paddingBottom: 0,
        },
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};
