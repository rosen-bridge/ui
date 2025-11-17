import React, { HTMLAttributes } from 'react';

import { Box } from '../../base';
import { InjectOverrides } from '../InjectOverrides';

/**
 * Props for the `CardTitle` component.
 *
 * Extends standard HTML `<div>` attributes.
 */
export type CardTitleProps = {} & HTMLAttributes<HTMLDivElement>;

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
const CardTitleBase = ({ children }: CardTitleProps) => {
  return <Box>{children}</Box>;
};

export const CardTitle = InjectOverrides(CardTitleBase);
