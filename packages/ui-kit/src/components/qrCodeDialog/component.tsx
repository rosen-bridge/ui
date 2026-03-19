import { ComponentProps } from 'react';

import { QRCodeCanvas } from 'qrcode.react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Stack,
} from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface QrCodeDialogOverrides { }

export type QrCodeDialogOwnProps = {
  value: string;
};

export type QrCodeDialogBaseProps = ElementBaseProps<
  typeof Dialog,
  QrCodeDialogOwnProps
>;

export type QrCodeDialogOverriddenProps = OverridableType<
  QrCodeDialogBaseProps,
  QrCodeDialogOverrides,
  never
>;

export const QrCodeDialogBase = ({
  value,
  onClose,
  ...rest
}: QrCodeDialogOverriddenProps) => {
  return (
    <Root as={Dialog} maxWidth="tablet" onClose={onClose} {...rest}>
      <DialogHeader>
        <DialogTitle>
          Scan QR Code
        </DialogTitle>
      </DialogHeader>
      <DialogDescription>
        Scan this code with your mobile device to access the content.
      </DialogDescription>
      <DialogContent>
        <Stack align="center" justify="center" spacing={2}>
          <QRCodeCanvas size={200} value={value} />
          <div style={{ textAlign: 'center', wordBreak: 'break-all' }}>
            {value}
          </div>
        </Stack>
      </DialogContent>
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </Root>
  );
};

QrCodeDialogBase.displayName = 'QrCodeDialog';

export const QrCodeDialog = Wrap(QrCodeDialogBase);

export type QrCodeDialogProps = ComponentProps<typeof QrCodeDialog>;
