import React, { HTMLAttributes } from 'react';

import { Box } from '../../base';

/**
 * Props for the CardBody component.
 *
 * Extends standard HTML <div> attributes.
 */
type CardBodyProps = {} & HTMLAttributes<HTMLDivElement>;

/**
 * CardBody is a content container used within a Card component.
 * It provides consistent padding and spacing rules depending on
 * the card variant and its neighboring elements (e.g., `CardHeader`).
 *
 * This component applies conditional padding styles:
 * - Removes top padding if it follows a card2-header inside a non-separated card.
 * - Removes bottom padding if it's immediately followed by another card2-header.
 *
 * @example
 *
 * <Card>
 *   <CardHeader>Header</CardHeader>
 *   <CardBody>
 *     <Typography>Content goes here</Typography>
 *   </CardBody>
 * </Card>
 *
 */
export const CardBody = ({ children, style, ...rest }: CardBodyProps) => {
  return (
    <Box
      className="card2-body"
      sx={{
        'padding': (theme) => theme.spacing(2),
        ...(style || {}),
        '.card2:not(.card2-separated) > .card2-header + &, .card2:not(.card2-separated) > .card2-header + * &':
          {
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
