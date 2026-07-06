import {
  EnhancedDialog,
  EnhancedDialogContent,
  EnhancedDialogTitle,
} from '@rosen-bridge/ui-kit';

import { RecentTransaction } from './types';

export type DetailsProps = {
  value?: RecentTransaction;
  onClose?: () => void;
};

export const Details = ({ value, onClose }: DetailsProps) => {
  return (
    <EnhancedDialog open={!!value} stickOn="mobile" onClose={onClose}>
      <EnhancedDialogTitle onClose={onClose}>TODO</EnhancedDialogTitle>
      <EnhancedDialogContent>TODO</EnhancedDialogContent>
    </EnhancedDialog>
  );
};
