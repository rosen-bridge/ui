import type { EventStatusProps } from '@rosen-bridge/ui-kit';

import type { EventDetailsType } from '@/backend/events/repository';

export const eventStatusParser = (
  status?: EventDetailsType['status'],
): EventStatusProps['value'] | undefined => {
  if (!status) return;

  if (typeof status === 'string') return status;

  return {
    icon: 'ExclamationCircle',
    label: status.status,
    severity: status.severity,
  };
};
