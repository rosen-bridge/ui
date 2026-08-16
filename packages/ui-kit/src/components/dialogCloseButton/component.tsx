import { Dialog as DialogBaseUI } from '@base-ui/react/dialog';

import { CloseButton, type CloseButtonProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface DialogCloseButtonOverrides {}

export type DialogCloseButtonOwnProps = {};

export type DialogCloseButtonBaseProps = ElementBaseProps<
  typeof CloseButton,
  DialogCloseButtonOwnProps
>;

export type DialogCloseButtonProps = OverridableType<
  DialogCloseButtonBaseProps,
  DialogCloseButtonOverrides,
  never
>;

export const DialogCloseButton = (props: DialogCloseButtonProps) => {
  const { ...rest } = useConfig('DialogCloseButton', props);

  return (
    <DialogBaseUI.Close
      render={(props) => <CloseButton {...(props as unknown as CloseButtonProps)} />}
      {...rest}
    />
  );
};

DialogCloseButton.displayName = 'DialogCloseButton';
