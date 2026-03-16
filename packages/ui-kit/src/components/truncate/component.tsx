import { ComponentProps } from 'react';

import { Slot } from '@radix-ui/react-slot';

import { OverridableType } from '@/@types';
import { Tooltip, TooltipOverriddenProps } from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TruncateOverrides {}

export type TruncateOwnProps = {
  asChild?: boolean;

  /**
   * Number of lines to display before truncating the content.
   * @default 1
   */
  lines?: number;

  slots?: {
    tooltip?: TooltipOverriddenProps;
  };

  tooltip?: boolean;
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
export const TruncateBase = ({
  asChild,
  children,
  lines = 1,
  slots,
  tooltip = true,
  ...rest
}: TruncateOverriddenProps) => {
  return (
    <Tooltip disabled={!tooltip} title={children} {...slots?.tooltip}>
      <Root
        as={asChild ? Slot : 'div'}
        styles={{ WebkitLineClamp: lines }}
        {...rest}
      >
        {children}
      </Root>
    </Tooltip>
  );
};

TruncateBase.displayName = 'Truncate';

export const Truncate = Wrap(TruncateBase);

export type TruncateProps = ComponentProps<typeof Truncate>;
