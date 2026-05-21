import { useEffect, useRef } from 'react';

import { Icon, IconButton } from '@/components';
import { useDisclosure, useTransition } from '@/hooks';
import { OverridableType, ElementBaseProps } from '@/types';

import './styles.css';

type UseDisclosureReturn = ReturnType<typeof useDisclosure>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DisclosureButtonOverrides {}

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

/**
 * A smart button component for controlling disclosure states
 *
 * @remarks
 * Automatically displays appropriate icons and handles state transitions:
 * - Down arrow for closed state
 * - Up arrow when open
 * - Loading spinner during async operations
 * - Error icon when something fails
 *
 * @param props - Component props
 * @param props.disclosure - The disclosure object from useDisclosure hook
 * @param props.disabled - Optional manual disable state
 * @param props.size - Button size ('small' | 'medium' | 'large')
 */
export const DisclosureButton = ({
  disclosure,
  disabled,
  size,
}: DisclosureButtonProps) => {
  const ref = useRef<HTMLButtonElement | null>(null);

  const { enter, leave, stop, animation } = useTransition({
    ref: ref,
  });

  useEffect(() => {
    if (disclosure.state === 'open') {
      enter();
    } else if (disclosure.state === 'close') {
      leave();
    }

    return () => {
      stop();
    };
  }, [disclosure.state, enter, leave, stop]);

  return (
    <IconButton
      ref={ref}
      {...animation}
      data-error={disclosure.state === 'error' && 'error'}
      className="RosenDisclosureButton"
      size={size}
      disabled={disclosure.state == 'loading' || disabled}
      loading={disclosure.state == 'loading'}
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

DisclosureButton.displayName = 'DisclosureButton';
