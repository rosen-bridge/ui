import React, { HTMLAttributes, ReactNode } from 'react';

/**
 * Props for the `Center` component.
 *
 * @property children - Elements to be centered inside the container.
 * @property inline - If true, uses `inline-flex` instead of `flex`.
 * @property style - Additional CSS styles.
 */
type CenterProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  inline?: boolean;
};

/**
 * Centers its children both vertically and horizontally using Flexbox.
 *
 * @param props - Center component props.
 * @returns A div that centers its content.
 */
export const Center = ({ children, inline, style, ...rest }: CenterProps) => {
  return (
    <div
      style={Object.assign(
        {},
        {
          display: inline ? 'inline-flex' : 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        },
        style,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
