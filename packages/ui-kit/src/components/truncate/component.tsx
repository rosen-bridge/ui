import { Slot } from '@radix-ui/react-slot';

import { Tooltip, type TooltipProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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
    tooltip?: TooltipProps;
  };

  tooltip?: boolean;
};

export type TruncateBaseProps = ElementBaseProps<'div', TruncateOwnProps>;

export type TruncateProps = OverridableType<
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
export const Truncate = (props: TruncateProps) => {
  const {
    asChild,
    children,
    lines = 1,
    slots,
    tooltip = true,
    ...rest
  } = useConfig('Truncate', props);

  const Component = asChild ? Slot : 'div';

  return (
    <Tooltip disabled={!tooltip} title={children} {...slots?.tooltip}>
      <Component style={{ WebkitLineClamp: lines }} {...rest}>
        {children}
      </Component>
    </Tooltip>
  );
};

Truncate.displayName = 'Truncate';
