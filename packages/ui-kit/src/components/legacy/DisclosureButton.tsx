import { IconButton } from '@mui/material';

import type { useDisclosure } from '../../hooks/useDisclosure';
import { Icon } from '../icon';
import { Transition } from '../transition';
import { CircularProgress } from './Mui';

import './DisclosureButton.css';

/**
 * Return type of the useDisclosure hook for type safety
 */
export type UseDisclosureReturn = ReturnType<typeof useDisclosure>;

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
 *
 * @example
 * const disclosure = useDisclosure();
 * return (
 *   <div>
 *     <DisclosureButton disclosure={disclosure} />
 *     <Collapse in={disclosure.state === 'open'}>
 *       Content here
 *     </Collapse>
 *   </div>
 * );
 */
export const DisclosureButton = ({
  disabled,
  disclosure,
  size,
}: {
  disabled?: boolean;
  disclosure: UseDisclosureReturn;
  size?: 'small' | 'medium' | 'large';
}) => {
  return (
    <IconButton
      className="RosenDisclosureButton"
      size={size}
      disabled={disclosure.state === 'loading' || disabled}
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
      <Transition>
        {disclosure.state === 'loading' ? (
          <CircularProgress key="loading" size={24} />
        ) : disclosure.state === 'error' ? (
          <Icon key="error" color="error" name="SyncExclamation" />
        ) : (
          <Icon
            key="arrow"
            name="AngleDown"
            style={{ rotate: disclosure.state === 'open' ? '180deg' : undefined }}
          />
        )}
      </Transition>
    </IconButton>
  );
};
