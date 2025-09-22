import { ComponentProps, forwardRef, HTMLAttributes, useMemo } from 'react';

import { Wrap } from '../core';

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
  const {
    children,
    inline,
    style,
    ...rest
  } = props;


  const styles = useMemo(() => Object.assign(
    {},
    {
      display: inline ? 'inline-flex' : 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
    style,
  ), [inline, style]);

  return (
    <div ref={ref} style={styles} {...rest}>
      {children}
    </div>
  );
});

CenterBase.displayName = "Center";

export const Center = Wrap(CenterBase);

export type CenterProps = ComponentProps<typeof Center>;


