import React, { HTMLAttributes, ReactNode } from 'react';

import { Box } from '../../base';

/**
 * Props for the `Card2Header` component.
 */
type Card2HeaderProps = {
  /**
   * The main content of the header, typically a title or custom element.
   * This will be placed on the left side and take up remaining horizontal space.
   */
  children?: ReactNode;

  /**
   * Optional action element rendered on the right side of the header.
   * Typically a button, icon, or menu.
   */
  action?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

/**
 * `Card2Header` is a layout component intended to be used
 * as the header section within a `Card2` component.
 *
 * It supports a main content area (`children`) and an optional
 * action element aligned to the right.
 *
 * When used inside a `Card2` with the `separated` variant,
 * a dashed bottom border is rendered to visually separate the header.
 *
 * @example
 * ```tsx
 * <Card2Header
 *   action={<IconButton><MoreVertIcon /></IconButton>}
 * >
 *   <Typography variant="h6">Card Title</Typography>
 * </Card2Header>
 * ```
 */
export const Card2Header = ({ children, action }: Card2HeaderProps) => {
  return (
    <Box
      className="card2-header"
      sx={{
        'display': 'flex',
        'alignItems': 'center',
        'borderRadius': (theme) => theme.spacing(2),
        'padding': (theme) => theme.spacing(2),
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
      }}
    >
      <div style={{ flexGrow: 1 }}>{children}</div>
      {action && <div>{action}</div>}
    </Box>
  );
};
