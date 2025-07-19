import React from 'react';

/**
 * Props for the `Center` component.
 *
 * @property children - The React elements to be centered inside the container.
 * @property inline - If `true`, uses `inline-flex` instead of `flex` to render
 *   the container as an inline element.
 */
type CenterProps = {
  children?: React.ReactNode;
  inline?: boolean;
};

/**
 * `Center` is a utility layout component that centers its children
 * both vertically and horizontally within its parent container.
 *
 * It uses CSS Flexbox (`flex` or `inline-flex`) with `width` and `height` set to `100%`
 * to fill the available space of the parent element.
 *
 * ⚠️ **Warning:** Make sure the parent element has a defined height,
 * otherwise the content will not be vertically centered.
 *
 * @example
 * ```tsx
 * <div style={{ height: '300px' }}>
 *   <Center>
 *     <p>Hello, I’m centered!</p>
 *   </Center>
 *
 *   <Center inline>
 *     <span>I'm inline-centered!</span>
 *   </Center>
 * </div>
 * ```
 */
export const Center = ({ children, inline }: CenterProps) => {
  return (
    <div
      style={{
        display: inline ? 'inline-flex' : 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
};
