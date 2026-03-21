import { ComponentProps } from 'react';

import { ElementBaseProps, Root, Wrap } from '@/core';
import { ColorOverridden, OverridableType } from '@/types';

import './styles.scss';
import { InfoIcon, Typography } from '@/components';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LabelOverrides { }

export type LabelOwnProps = {
  /**
   * The color of the label text.
   */
  color?: ColorOverridden;

  /**
   * Reduces vertical padding for a denser layout.
   */
  dense?: boolean;

  /**
   * An optional info text to display in a tooltip.
   * If provided, an info icon will appear next to the label.
   */
  info?: string;

  /**
   * When true, renders the label with an "inset" style,
   * showing a dashed border indicator on the left.
   */
  inset?: boolean;

  /**
   * The text to be displayed as the main label.
   */
  label: string;

  /**
   * Layout orientation of the label and content.
   * - `horizontal`: label and content are side by side.
   * - `vertical`: label is placed above the content.
   */
  orientation?: 'horizontal' | 'vertical';
};

export type LabelBaseProps = ElementBaseProps<'div', LabelOwnProps>;

export type LabelOverriddenProps = OverridableType<
  LabelBaseProps,
  LabelOverrides,
  'color'
>;

/**
 * A reusable label component that supports optional tooltip info,
 * orientation (horizontal or vertical), inset styling, and dense layout.
 *
 * Useful for form-like UIs where labels and values need consistent styling.
 */
export const LabelBase = ({
  children,
  color = 'text-secondary',
  dense = false,
  info,
  inset = false,
  label,
  orientation = 'horizontal',
  ...rest
}: LabelOverriddenProps) => {
  return (
    <Root reflects={{ dense, inset, orientation }} {...rest}>
      <div className='RosenLabel-header'>
        <Typography
          color={color}
          lineHeight="1.5rem"
          noWrap
          variant="body2"
          sx={{
            my: orientation === 'vertical' ? 0 : 0.5,
          }}
        >
          {label}
        </Typography>
        {info && <InfoIcon color={color} info={info} />}
      </div>
      <div className='RosenLabel-content'>{children}</div>
    </Root>
  )
};

LabelBase.displayName = 'Label';

export const Label = Wrap(LabelBase);

export type LabelProps = ComponentProps<typeof Label>;
