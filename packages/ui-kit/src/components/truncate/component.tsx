import { useLayoutEffect, useRef, useState } from 'react';

import { Slot } from '@radix-ui/react-slot';

import { Button, type ButtonProps, Tooltip, type TooltipProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface TruncateOverrides {}

export type TruncateOwnProps = {
  asChild?: boolean;

  /**
   * Replaces the static line clamp with a "Show more" / "Show less" toggle, fading the last
   * line to transparent once the content actually overflows `lines`.
   * @default false
   */
  expandable?: boolean;

  /**
   * Number of lines to display before truncating the content.
   * @default 1
   */
  lines?: number;

  slots?: {
    action?: ButtonProps;
    tooltip?: TooltipProps;
  };

  tooltip?: boolean;
};

export type TruncateBaseProps = ElementBaseProps<'div', TruncateOwnProps>;

export type TruncateProps = OverridableType<TruncateBaseProps, TruncateOverrides, never>;

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
    expandable,
    lines = 1,
    slots,
    tooltip = true,
    ...rest
  } = useConfig('Truncate', props);

  const Component = asChild ? Slot : 'div';

  const ref = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    void children;

    if (!expandable || !ref.current) return;

    setOverflowing(ref.current.scrollHeight > ref.current.clientHeight + 1);
  }, [expandable, children]);

  return (
    <>
      <Tooltip disabled={expandable || !tooltip} title={children} {...slots?.tooltip}>
        <Component
          data-fade={!expanded && overflowing}
          ref={ref}
          style={{ WebkitLineClamp: expanded ? 'unset' : lines }}
          {...rest}
        >
          {children}
        </Component>
      </Tooltip>
      {expandable && overflowing && (
        <div className="RosenTruncateAction">
          <Button
            color="inherit"
            size="small"
            variant="text"
            onClick={() => setExpanded((value) => !value)}
            {...slots?.action}
          >
            {expanded ? 'Show less' : 'Show more'}
          </Button>
        </div>
      )}
    </>
  );
};

Truncate.displayName = 'Truncate';
