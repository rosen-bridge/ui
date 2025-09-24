import { ComponentProps, forwardRef, HTMLAttributes } from 'react';

import { Wrap } from '../../core';

/**
 * Props for the `Center` component.
 */
type CenterPropsBase = HTMLAttributes<HTMLDivElement> & {
  inline?: boolean;
};

/**
 * Centers its children both vertically and horizontally
 */
const CenterBase = forwardRef<HTMLDivElement, CenterPropsBase>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
});

CenterBase.displayName = "Center";

export const Center = Wrap(CenterBase, { reflects: [{ property: 'inline' }] });

export type CenterProps = ComponentProps<typeof Center>;


