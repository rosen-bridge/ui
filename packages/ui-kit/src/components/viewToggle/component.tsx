// TODO: use ToggleButton button and add slots
import { Icon, IconButton } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

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

export type ViewToggleProps = OverridableType<
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
}: ViewToggleProps) => {
  return (
    <div {...rest}>
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
    </div>
  );
};

ViewToggleBase.displayName = 'ViewToggle';

export const ViewToggle = Wrap(ViewToggleBase);
