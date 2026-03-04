import { ComponentProps } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { OverridableType } from '../../@types';
import { Icon } from '../icon';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ViewToggleOverrides { }

export type ViewToggleType = 'grid' | 'row';

export type ViewToggleOwnProps = {
  disabled?: boolean;
  value?: ViewToggleType;
  onChange?: (value: ViewToggleType) => void;
};

export type ViewToggleBaseProps = ElementBaseProps<'div', ViewToggleOwnProps>;

export type ViewToggleOverriddenProps = OverridableType<
  ViewToggleBaseProps,
  ViewToggleOverrides,
  never
>;

/**
 * A simple toggle component for switching between 'grid' and 'row' view modes.
 */
export const ViewToggleBase = ({ disabled, value, onChange, ...rest }: ViewToggleOverriddenProps) => {
  return (
    <Root {...rest}>
      <button
        className={value === 'row' ? 'active' : ''}
        disabled={disabled}
        type="button"
        onClick={() => onChange?.('row')}
      >
        <Icon name="Row" />
      </button>
      <button
        className={value === 'grid' ? 'active' : ''}
        disabled={disabled}
        type="button"
        onClick={() => onChange?.('grid')}
      >
        <Icon name="Grid" />
      </button>
    </Root>
  )
};

ViewToggleBase.displayName = 'ViewToggle';

export const ViewToggle = Wrap(ViewToggleBase);

export type ViewToggleProps = ComponentProps<typeof ViewToggle>;
