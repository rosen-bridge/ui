import React, { HTMLAttributes, ReactNode } from 'react';

import { Box } from '../../base';
import { InjectOverrides } from '../InjectOverrides';

/**
 * Props for the `CardHeader` component.
 */
export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Optional action element rendered on the right side of the header.
   * Typically a button, icon, or menu.
   */
  action?: ReactNode;
  /**
   * The main content of the header, typically a title or custom element.
   * This will be placed on the left side and take up remaining horizontal space.
   */
  children?: ReactNode;
};

/**
 * `CardHeader` is a layout component intended to be used
 * as the header section within a `Card` component.
 *
 * It supports a main content area (`children`) and an optional
 * action element aligned to the right.
 *
 * When used inside a `Card` with the `separated` variant,
 * a dashed bottom border is rendered to visually separate the header.
 *
 * @example
 * ```tsx
 * <CardHeader
 *   action={<IconButton><MoreVertIcon /></IconButton>}
 * >
 *   <Typography variant="h6">Card Title</Typography>
 * </CardHeader>
 * ```
 */
const CardHeaderBase = ({ action, children }: CardHeaderProps) => {
  return (
    <Box
      className="card2-header"
      sx={{
        'display': 'flex',
        'alignItems': 'center',
        'borderRadius': (theme) => theme.spacing(2),
        'padding': (theme) => theme.spacing(2),
        '.card2-section &': {
          padding: (theme) => theme.spacing(3),
        },
        '.card2-separated &': {
          position: 'relative',
        },
        '.card2-separated &:after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: (theme) => theme.spacing(2),
          right: (theme) => theme.spacing(2),
          borderBottom: (theme) => `1px dashed ${theme.palette.neutral.light}`,
        },

        '.card2-section.card2-separated &:after': {
          left: (theme) => theme.spacing(3),
          right: (theme) => theme.spacing(3),
        },
      }}
    >
      <div style={{ flexGrow: 1 }}>{children}</div>
      {action && <div>{action}</div>}
    </Box>
  );
};

export const CardHeader = InjectOverrides(CardHeaderBase);
