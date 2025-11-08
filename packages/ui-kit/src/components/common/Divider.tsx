import { ComponentProps, forwardRef, HTMLAttributes, useMemo } from 'react';

import { Divider as MuiDivider } from '@mui/material';

import { InjectOverrides } from './InjectOverrides';

/**
 * Props for the `Divider` component.
 */
export type DividerPropsBase = HTMLAttributes<HTMLHRElement> & {
  /**
   * Sets the border style of the divider.
   * @default 'solid'
   */
  borderStyle?: 'dashed' | 'solid';

  /**
   * Orientation of the divider, horizontal or vertical.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Text placement if the divider has children.
   * Only applicable for horizontal orientation.
   * @default 'center'
   */
  placement?: 'left';

  /**
   * Thickness of the divider line. Accepts any valid CSS size value.
   * @default '1px'
   */
  thickness?: string;

  /**
   * Variant of the divider.
   * - `full`: full width (default)
   * - `inset`: inset divider
   * - `middle`: middle divider
   * @default 'full'
   */
  variant?: 'full' | 'inset' | 'middle';
};

/**
 * A customizable Divider component built on top of MUI Divider.
 *
 * Supports custom border style, thickness, placement, and variant.
 * Can wrap content for labeled dividers.
 */
const DividerBase = forwardRef<HTMLHRElement, DividerPropsBase>(
  (props, ref) => {
    const {
      borderStyle = 'solid',
      children,
      orientation = 'horizontal',
      placement = 'left',
      thickness = '1px',
      variant = 'full',
      ...rest
    } = props;

    const styles = useMemo(
      () => ({
        '&::before, &::after': {
          borderTopStyle: borderStyle,
          borderTopWidth: thickness,
        },
        '&::before': {
          flex: placement === 'left' ? 0 : 1,
        },
        '&::after': {
          flex: placement === 'left' ? 1 : 1,
        },
        '& .MuiDivider-wrapper': {
          paddingLeft: placement === 'left' ? 0 : undefined,
        },
      }),
      [borderStyle, thickness, placement],
    );

    return (
      <MuiDivider
        orientation={orientation}
        ref={ref}
        sx={styles}
        textAlign={placement}
        variant={variant === 'full' ? 'fullWidth' : variant}
        {...rest}
      >
        {children}
      </MuiDivider>
    );
  },
);

DividerBase.displayName = 'Divider';

export const Divider = InjectOverrides(DividerBase);

export type DividerProps = ComponentProps<typeof Divider>;
