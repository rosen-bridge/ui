import { ReactNode, useMemo } from 'react';

import { CheckCircle } from '@rosen-bridge/icons';
import { QuestionMark } from '@rosen-bridge/icons';
import { Chip, ChipProps } from '@rosen-bridge/ui-kit';

import { ReprocessRequest, REQUEST_STATUS } from './page';

interface ReprocessStatusProps {
  status: ReprocessRequest['status'];
  hideIcon?: boolean;
  loading?: boolean;
}

export const ReprocessStatus = ({
  status,
  hideIcon = false,
  loading,
}: ReprocessStatusProps) => {
  const [color, icon]: [ChipProps['color'], ReactNode] = useMemo(() => {
    switch (status) {
      case 'ACCEPTED':
        return ['success', <CheckCircle key="accepted" />];
      default:
        return ['neutral', <QuestionMark key="default" />];
    }
  }, [status]);

  const label = status ? REQUEST_STATUS[status] : 'Unknown';

  return (
    <Chip
      label={label}
      color={color}
      icon={hideIcon ? undefined : icon}
      loading={loading}
    />
  );
};
