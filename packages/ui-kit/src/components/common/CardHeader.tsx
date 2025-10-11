import React from 'react';

import {
  CardHeader as MuiCardHeader,
  CardHeaderProps as MuiCardHeaderProps,
  Divider,
} from '@mui/material';

/**
 * Props for `CardHeader` component.
 * Extends MUI `CardHeader` props with an optional `separator` prop.
 */
export interface CardHeaderProps extends MuiCardHeaderProps {
  /**
   * Shows a dashed divider below the header if `true`.
   */
  separator?: boolean;
  /**
   * For change font size in title
   */
  regular?: boolean;
}

/**
 * `CardHeader` wraps MUI's `CardHeader` and adds an optional dashed separator below.
 *
 * Useful when you want a clear visual split between the header and content.
 *
 * @example
 * ```tsx
 * <CardHeader
 *   title="My Card"
 *   subheader="Optional subheader"
 *   separator
 *   regular
 * />
 * ```
 */
export const CardHeader = ({
  regular,
  separator,
  ...props
}: CardHeaderProps) => {
  return (
    <>
      <MuiCardHeader
        titleTypographyProps={{
          sx: {
            fontWeight: regular ? 'normal' : 'bold',
            color: regular ? 'text.primary' : undefined,
          },
        }}
        sx={{
          ...(props.sx || {}),
          ...(separator && { paddingBottom: (theme) => theme.spacing(1) }),
        }}
        {...props}
      />
      {separator && (
        <Divider
          sx={{
            borderStyle: 'dashed',
            marginBottom: (theme) => theme.spacing(1),
          }}
          variant="middle"
        />
      )}
    </>
  );
};
