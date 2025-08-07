import { Chip } from '@rosen-bridge/ui-kit';

import { EventItem } from '@/types';

export type EventStatusProps = {
  value: EventItem['status'];
};

export const EventStatus = ({ value }: EventStatusProps) => {
  switch (value) {
    case 'fraud':
      return null;
    case 'processing':
      return <Chip label={value} color="info" icon="HourGlass" />;
    case 'successful':
      return <Chip label={value} color="success" icon="CheckCircle" />;
  }
};
