import React, { HTMLAttributes } from 'react';

import { Box } from '../../base';
import { InjectOverrides } from '../InjectOverrides';

/**
 * Props for the CardBody component.
 *
 * Extends standard HTML <div> attributes.
 */
export type CardBodyProps = {} & HTMLAttributes<HTMLDivElement>;

/**
 * CardBody is a container inside Card that handles padding rules.
 *
 * - Removes top padding after a header in non-separated cards.
 * - Removes bottom padding if followed by a header.
 */
const CardBodyBase = ({ children, style, ...rest }: CardBodyProps) => {
  return (
    <Box
      className="card2-body"
      sx={{
        '.card2-section &': {
          padding: (theme) => theme.spacing(3),
        },
        '.card2-section:not(.card2-separated) &': {
          paddingTop: 0,
        },
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

export const CardBody = InjectOverrides(CardBodyBase);
