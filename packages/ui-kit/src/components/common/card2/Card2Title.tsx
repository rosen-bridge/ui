import React, { HTMLAttributes } from 'react';

import { Box } from '../../base';

/**
 * Props for the `Card2Title` component.
 *
 * Extends standard HTML `<div>` attributes.
 */
type Card2TitleProps = {} & HTMLAttributes<HTMLDivElement>;

/**
 * `Card2Title` is a simple wrapper component for rendering a title
 * or heading inside a `Card2` component.
 *
 * It accepts any valid React children and applies default layout styles
 * through the `Box` component.
 *
 * @example
 * ```tsx
 * <Card2Title>
 *   <Typography variant="h6">Dashboard</Typography>
 * </Card2Title>
 * ```
 */
export const Card2Title = ({ children }: Card2TitleProps) => {
  return <Box>{children}</Box>;
};
