import { Dialog as DialogBaseUI } from '@base-ui/react/dialog';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogOverrides {}

export type DialogOwnProps = {
  open?: boolean;
  maxWidth?: string;
  stickOn?: string;
  onClose?: () => void;
};

export type DialogBaseProps = ElementBaseProps<'div', DialogOwnProps>;

export type DialogProps = OverridableType<
  DialogBaseProps,
  DialogOverrides,
  never
>;

export const Dialog = (props: DialogProps) => {
  const { open, maxWidth, stickOn, onClose, ...rest } = useConfig(
    'Dialog',
    props,
  );

  void maxWidth;
  void stickOn;

  return (
    <DialogBaseUI.Root
      open={open}
      onOpenChange={(open) => !open && onClose?.()}
    >
      <DialogBaseUI.Portal>
        <DialogBaseUI.Backdrop className="RosenDialog-backdrop" />
        <DialogBaseUI.Popup {...rest} />
      </DialogBaseUI.Portal>
    </DialogBaseUI.Root>
  );
};

Dialog.displayName = 'Dialog';
