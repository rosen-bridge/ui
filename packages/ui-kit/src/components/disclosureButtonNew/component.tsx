import { Icon, IconButton } from '@/components';
import { useDisclosure } from '@/hooks';
import { OverridableType, ElementBaseProps } from '@/types';

import './styles.scss';

type UseDisclosureReturn = ReturnType<typeof useDisclosure>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DisclosureButtonOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type DisclosureButtonOwnProps = {
  disabled?: boolean;
  disclosure: UseDisclosureReturn;
  size?: 'small' | 'medium' | 'large';
};

export type DisclosureButtonBaseProps = ElementBaseProps<
  'div',
  DisclosureButtonOwnProps
>;

export type DisclosureButtonProps = OverridableType<
  DisclosureButtonBaseProps,
  DisclosureButtonOverrides,
  never
>;

export const DisclosureButtonNew = ({
  disclosure,
  disabled,
  size,
}: DisclosureButtonProps) => {
  return (
    <IconButton
      className="RosenDisclosureButton"
      size={size}
      disabled={disclosure.state == 'loading' || disabled}
      loading={disclosure.state == 'loading'}
      sx={{
        color: disclosure.state == 'error' ? 'red' : undefined,
        transform: `rotate(${disclosure.state == 'open' ? 180 : 0}deg)`,
        transition: (theme) => {
          return theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
          });
        },
      }}
      onClick={async () => {
        switch (disclosure.state) {
          case 'close':
            await disclosure.open();
            break;
          case 'error':
            await disclosure.open();
            break;
          case 'open':
            await disclosure.close();
            break;
        }
      }}
    >
      <Icon
        name={disclosure.state == 'error' ? 'SyncExclamation' : 'AngleDown'}
      />
    </IconButton>
  );
};

DisclosureButtonNew.displayName = 'DisclosureButton';
