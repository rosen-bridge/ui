// TODO: use ToggleButton button
import { ComponentProps } from 'react';

import { OverridableType } from '../../@types';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { Icon } from '../icon';
import { IconButton } from '../iconButton';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ViewToggleOverrides {}

export type ViewToggleType = 'grid' | 'row';

// TODO: add slots, size, ...
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
export const ViewToggleBase = ({
  disabled,
  value,
  onChange,
  ...rest
}: ViewToggleOverriddenProps) => {
  return (
    <Root {...rest}>
      <IconButton
        className={value === 'row' ? 'active' : ''}
        disabled={disabled}
        onClick={() => onChange?.('row')}
      >
        <Icon name="Row" />
      </IconButton>
      <IconButton
        className={value === 'grid' ? 'active' : ''}
        disabled={disabled}
        onClick={() => onChange?.('grid')}
      >
        <Icon name="Grid" />
      </IconButton>
    </Root>
  );
};

ViewToggleBase.displayName = 'ViewToggle';

export const ViewToggle = Wrap(ViewToggleBase);

export type ViewToggleProps = ComponentProps<typeof ViewToggle>;
