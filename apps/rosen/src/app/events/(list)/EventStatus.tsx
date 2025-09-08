import { Chip } from '@rosen-bridge/ui-kit';

import { EventItem } from '@/types';

export type EventStatusProps = {
  value: EventItem['status'];
};

export const EventStatus = ({ value }: EventStatusProps) => {
  switch (value) {
    case 'fraud':
      return <Chip label={value} color="error" icon="CloseCircle" />;
    case 'processing':
      return <Chip label={value} color="info" icon="Hourglass" />;
    case 'successful':
      return <Chip label={value} color="success" icon="CheckCircle" />;
  }
};
