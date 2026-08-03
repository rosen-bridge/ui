import { type CSSProperties, useMemo } from 'react';

import {
  Collapsible,
  DateTime,
  Icon,
  IconButton,
  type IconProps,
  Tooltip,
  Typography,
} from '@/components';
import type { Color } from '@/types';
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

  const open = active === value;

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
          disabled={!description && !timestamp}
          title={
            <div>
              {timestamp && <DateTime color="inherit" timestamp={timestamp} />}
              {description && (
                <Typography variant="caption">{description}</Typography>
              )}
            </div>
          }
        >
          <div className="RosenStep-dot">
            <Icon name={icon} size="medium" color="inherit" />
          </div>
        </Tooltip>
        <div className="RosenStep-line" />
      </div>
      <div className="RosenStep-content">
        <div className="RosenStep-label">
          <Typography variant="body1">{label}</Typography>
        </div>
        {sub && (
          <>
            <IconButton onClick={() => setActive?.(open ? undefined : value)}>
              <Icon name={open ? 'AngleUp' : 'AngleDown'} />
            </IconButton>
            <Collapsible open={open}>
              <div className="RosenStep-sub">
                <Line />
                <div data-level="sub" className="sub">
                  {sub?.map((item, index) => (
                    <Step key={index.toString()} {...item} />
                  ))}
                </div>
              </div>
            </Collapsible>
          </>
        )}
      </div>
    </div>
  );
};
