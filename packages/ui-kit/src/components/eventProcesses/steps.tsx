import { CSSProperties, useMemo } from 'react';

import { DateTime, Icon, IconProps, Tooltip, Typography } from '@/components';
import { Color } from '@/types';
import { toCSSColor } from '@/utils';

import { Line } from './line';

export type StepProps = {
  active?: string;
  color?: Color;
  description?: string;
  icon?: IconProps['name'];
  label?: string;
  setActive?: (value?: string) => void;
  sub?: Omit<StepProps, 'sub'>[];
  timestamp?: number;
  value?: string;
  line?: boolean;
};

export const Step = (props: StepProps) => {
  const {
    active,
    color,
    description,
    icon,
    label,
    setActive,
    sub,
    timestamp,
    value,
  } = props;

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
          <div
            onClick={() => sub && setActive?.(value)}
            className="RosenStep-dot"
          >
            <Icon name={icon} size="medium" color="inherit" />
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
              {sub?.map((item, index) => (
                <Step key={index} {...item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
