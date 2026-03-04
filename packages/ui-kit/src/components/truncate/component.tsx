import { ComponentProps } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { OverridableType } from '../../@types';
import { Tooltip } from '../base';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TruncateOverrides { }

export type TruncateOwnProps = {
  /**
   * Number of lines to display before truncating the content.
   * @default 1
   */
  lines?: number;
};

export type TruncateBaseProps = ElementBaseProps<'div', TruncateOwnProps>;

export type TruncateOverriddenProps = OverridableType<
  TruncateBaseProps,
  TruncateOverrides,
  never
>;

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
export const TruncateBase = ({ children, lines = 1, ...rest }: TruncateOverriddenProps) => {
  return (
    <Tooltip title={children} placement="top">
      <Root styles={{ WebkitLineClamp: lines }} {...rest}>
        {children}
      </Root>
    </Tooltip>
  )
};

TruncateBase.displayName = 'Truncate';

export const Truncate = Wrap(TruncateBase);

export type TruncateProps = ComponentProps<typeof Truncate>;
