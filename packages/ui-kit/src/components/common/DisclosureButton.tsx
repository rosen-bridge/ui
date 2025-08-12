import { AngleDown, SyncExclamation } from '@rosen-bridge/icons';

import { useDisclosure } from '../../hooks/useDisclosure';
import { CircularProgress, IconButton, SvgIcon } from '../base';

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
      size={size}
      disabled={disclosure.state == 'loading' || disabled}
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
      {disclosure.state == 'loading' ? (
        <CircularProgress size={24} />
      ) : (
        <SvgIcon>
          {disclosure.state == 'error' ? <SyncExclamation /> : <AngleDown />}
        </SvgIcon>
      )}
    </IconButton>
  );
};
