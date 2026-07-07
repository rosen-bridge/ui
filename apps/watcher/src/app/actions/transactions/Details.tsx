import {
  Chip,
  DateTime,
  EnhancedDialog,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  Identifier,
  Label,
} from '@rosen-bridge/ui-kit';

import { STATUS_MAP, TYPE_MAP } from './constants';
import { RecentTransaction } from './types';

export type DetailsProps = {
  value?: RecentTransaction;
  onClose?: () => void;
};

export const Details = ({ value, onClose }: DetailsProps) => {
  const status = value?.status && STATUS_MAP[value.status];

  const type = value?.type && TYPE_MAP[value.type];

  return (
    <EnhancedDialog open={!!value} stickOn="mobile" onClose={onClose}>
      <EnhancedDialogTitle icon="Eye" onClose={onClose}>
        Transaction Details
      </EnhancedDialogTitle>
      <EnhancedDialogContent>
        <Label label="Id">
          <Identifier value={value?.id} />
        </Label>
        <Label label="Type">
          <Chip color="neutral-light" label={type} />
        </Label>
        <Label label="Status">
          <Chip
            color={status?.color}
            icon={status?.icon}
            label={status?.label}
          />
        </Label>
        <Label label="Last Update">
          <DateTime timestamp={value?.lastUpdate} />
        </Label>
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};
