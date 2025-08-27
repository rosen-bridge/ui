import React, { HTMLAttributes } from 'react';

import { Box } from '../../base';

/**
 * Props for the `CardTitle` component.
 *
 * Extends standard HTML `<div>` attributes.
 */
type CardTitleProps = {} & HTMLAttributes<HTMLDivElement>;

/**
 * `CardTitle` is a simple wrapper component for rendering a title
 * or heading inside a `Card` component.
 *
 * It accepts any valid React children and applies default layout styles
 * through the `Box` component.
 *
 * @example
 * ```tsx
 * <CardTitle>
 *   <Typography variant="h6">Dashboard</Typography>
 * </CardTitle>
 * ```
 */
export const CardTitle = ({ children }: CardTitleProps) => {
  return <Box>{children}</Box>;
};
