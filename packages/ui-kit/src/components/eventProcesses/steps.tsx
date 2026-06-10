import { CSSProperties, useMemo } from 'react';

import * as Icons from '@rosen-bridge/icons';

import { DateTime, Icon, Tooltip, Typography } from '@/components';
import { Line } from '@/components/eventProcesses/line';
import { Color } from '@/types';
import { toCSSColor } from '@/utils';

export type StepProps = {
  active?: string;
  color?: Color;
  description?: string;
  icon?: Exclude<keyof typeof Icons, 'TOKENS'>;
  label?: string;
  preview?: number;
  setActive?: (value?: string) => void;
  sub?: Omit<StepProps, 'sub'>[];
  timestamp?: number;
  value?: string;
};

export const Step = (props: StepProps) => {
  const {
    active,
    color,
    description,
    icon,
    label,
    preview,
    setActive,
    sub,
    timestamp,
    value,
  } = props;

  const stepHead = useMemo(() => {
    if (preview !== undefined) {
      return <Typography variant="body1">{preview}</Typography>;
    } else {
      return <Icon name={icon} size="medium" color="inherit" />;
    }
  }, [preview, icon]);

  const styles = useMemo(
    () =>
      ({
        '--rosen-step-color': toCSSColor(color),
      }) as CSSProperties,
    [color],
  );

  return (
    <div data-level="main" style={{ ...styles }} className="RosenStep">
      <div className="RosenStep-header">
        <div className="RosenStep-line" />
        <Tooltip
          title={
            <div>
              <Typography align="center" color="inherit" variant="body2">
                <DateTime timestamp={timestamp} />
              </Typography>
              <Typography variant="caption">{description}</Typography>
            </div>
          }
        >
          <div onClick={() => sub &&  setActive?.(value)} className="RosenStep-dot">
            {stepHead}
          </div>
        </Tooltip>
        <div className="RosenStep-line" />
      </div>
      <div className="RosenStep-content">
        <div className="RosenStep-label">
          <Typography variant="body1">{label}</Typography>
        </div>
        {active === value && sub && (
          <div className="RosenStep-sub">
            <Line />
            <div data-level="sub" className="sub">
              {sub?.map((item,index) => (
                <Step key={index} {...item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
