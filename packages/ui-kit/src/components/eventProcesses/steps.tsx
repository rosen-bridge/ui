import { useMemo } from 'react';

import * as Icons from '@rosen-bridge/icons';

import { Icon, Typography } from '@/components';
import { Line } from '@/components/eventProcesses/line';

export type StepProps = {
  title?: string;
  length?: number;
  status?: 'active' | 'done' | 'inComing';
  preview?: number | string;
  sub?: StepProps[];
};

export const Step = (props: StepProps) => {
  const { title, status, preview,sub } = props;

  const stepHead = useMemo(() => {
    if (typeof preview === 'number') {
      return <Typography variant="body1">{preview}</Typography>;
    }
    if (typeof preview === 'string') {
      return (
        <Icon
          name={preview as Exclude<keyof typeof Icons, 'TOKENS'>}
          size="medium"
          color="inherit"
        />
      );
    }
  }, [preview]);

  return (
    <div className="RosenStep">
      <div className="RosenStep-header">
        <div className="RosenStep-line" />
        <div data-state={status} className="RosenStep-dot">
          {stepHead}
        </div>
        <div className="RosenStep-line" />
      </div>
      <div className="RosenStep-content">
        <div data-state={status} className="RosenStep-label">
          <Typography>{title}</Typography>
        </div>
        {status === 'active' && (
          <div className="RosenStep-sub">
            <Line />
            <div className="sub">{sub?.map((item)=>(
              <Step {...item}/>//TODO: add key
            ))}</div>
          </div>
        )}
      </div>
    </div>
  );
};
