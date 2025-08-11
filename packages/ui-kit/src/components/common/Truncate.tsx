import React, { HTMLAttributes } from 'react';

import { Tooltip } from '../base';

type TruncateProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * The content to be truncated after a specified number of lines.
   */
  children?: React.ReactNode;

  /**
   * Number of lines to display before truncating the content.
   * @default 3
   */
  lines?: number;
};

/**
 * `Truncate` is a simple utility component that limits text to a specific number of lines.
 * It uses CSS line clamping (`-webkit-line-clamp`) to achieve multi-line truncation with ellipsis.
 *
 * You can pass all standard HTML `<div>` attributes, such as `className`, `id`, or `onClick`.
 *
 * @example
 * ```tsx
 * <Truncate lines={2}>
 *   This is some very long text that should be truncated after two lines...
 * </Truncate>
 * ```
 */
export const Truncate = ({
  children,
  lines = 3,
  style,
  ...rest
}: TruncateProps) => {
  return (
    <Tooltip title={children} placement="top">
      <div
        style={{
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    </Tooltip>
  );
};
