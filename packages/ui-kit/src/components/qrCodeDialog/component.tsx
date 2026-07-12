import { QRCodeCanvas } from 'qrcode.react';

import { Button, Stack } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import { Dialog } from '../dialog';
import { DialogContent } from '../dialogContent';
import { DialogFooter } from '../dialogFooter';

export interface QrCodeDialogOverrides {}

export type QrCodeDialogOwnProps = {
  value: string;
};

export type QrCodeDialogBaseProps = ElementBaseProps<
  typeof Dialog,
  QrCodeDialogOwnProps
>;

export type QrCodeDialogProps = OverridableType<
  QrCodeDialogBaseProps,
  QrCodeDialogOverrides,
  never
>;

export const QrCodeDialog = (props: QrCodeDialogProps) => {
  const { value, onClose, ...rest } = useConfig('QrCodeDialog', props);

  return (
    <Dialog maxWidth="tablet" onClose={onClose} {...rest}>
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
    </Dialog>
  );
};

QrCodeDialog.displayName = 'QrCodeDialog';
