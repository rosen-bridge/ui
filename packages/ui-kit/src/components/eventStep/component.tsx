import { Icon, Typography } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TransactionFlowStepOverrides {}

export type TransactionFlowStepOwnProps = {
  title?: string;
  length?: number;
  status: 'active' | 'done' | 'pending';
  index: number;
};

export type TransactionFlowStepBaseProps = ElementBaseProps<
  'div',
  TransactionFlowStepOwnProps
>;

export type TransactionFlowStepProps = OverridableType<
  TransactionFlowStepBaseProps,
  TransactionFlowStepOverrides,
  never
>;

/**
 * TODO : remove this component
 * TransactionFlow
 */
export const TransactionFlowStep = (props: TransactionFlowStepProps) => {
  const { title, status, index, children, ...rest } = useConfig(
    'TransactionFlowStep',
    props,
  );

  return (
    <div className="RosenTransactionFlowStep" {...rest}>
      <div className="RosenTransactionFlow-step-header">
        <div className="RosenTransactionFlow-line" />
        <div data-state={status} className="RosenTransactionFlow-step-dot">
          {status === 'active' ? (
            <Icon name="Hourglass" color="inherit" size="medium" />
          ) : status === 'done' ? (
            <Icon name="Check" color="inherit" size="medium" />
          ) : (
            <Typography variant="body1">{index + 1}</Typography>
          )}
        </div>
        <div className="RosenTransactionFlow-line" />
      </div>
      <div className="RosenTransactionFlow-step-content">
        <div data-state={status} className="RosenTransactionFlow-step-label">
          <Typography>{title}</Typography>
        </div>
        {children && status === 'active' && (
          <div className="RosenTransactionFlow-step">
            <Line />
            <div className="child">{children}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const Line = () => {
  return (
    <svg
      width="193"
      height="29"
      viewBox="0 0 193 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="95.5"
        y1="-2.18557e-08"
        x2="95.5"
        y2="24"
        stroke="#737373"
        stroke-dasharray="2 2"
      />
      <line
        x1="0.764893"
        y1="24.5"
        x2="192"
        y2="24.5"
        stroke="#737373"
        stroke-dasharray="2 2"
      />
      <line x1="0.5" y1="21" x2="0.5" y2="29" stroke="#737373" />
      <line x1="192.5" y1="21" x2="192.5" y2="29" stroke="#737373" />
    </svg>
  );
};
TransactionFlowStep.displayName = 'TransactionFlowStep';
