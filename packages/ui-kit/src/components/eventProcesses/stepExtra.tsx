import { Icon, Typography } from '@/components';
import { StepProps } from '@/components/eventProcesses/steps';

export const StepExtra = ({ label, icon, color }: StepProps) => {
  return (
    <div className="RosenStep-extra">
      <div className="RosenStep-label">
        <Icon size="small" color={color} name={icon} />
        <Typography variant="body1" color={color}>
          {label}
        </Typography>
      </div>
    </div>
  );
};
