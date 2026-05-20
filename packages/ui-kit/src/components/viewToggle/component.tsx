// TODO: use ToggleButton button and add slots
import { Icon, IconButton } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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
export const ViewToggle = (props: ViewToggleProps) => {
  const { disabled, value, onChange, ...rest } = useConfig('ViewToggle', props);

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

ViewToggle.displayName = 'ViewToggle';
