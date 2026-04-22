import { ReactNode, useMemo } from 'react';

import { Collapsible, Icon, IconProps } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlertOverrides {}

export type AlertOwnProps = {
  action?: ReactNode;
  dismissible?: boolean;
  severity?: 'success' | 'info' | 'warning' | 'error';
  timeout?: number;
  variant?: 'filled' | 'standard';
  onClose?: () => void;
};

export type AlertBaseProps = ElementBaseProps<'div', AlertOwnProps>;

export type AlertProps = OverridableType<AlertBaseProps, AlertOverrides, never>;

export const Alert = (props: AlertProps) => {
  const {
    action,
    children,
    dismissible,
    severity = 'info',
    timeout,
    variant,
    onClose,
    ...rest
  } = useConfig('Alert', props);

  void dismissible;
  void timeout;
  void onClose;

  const icon = useMemo<IconProps['name']>(() => {
    switch (severity) {
      case 'success':
        return 'CheckCircle';
      case 'warning':
        return 'InfoCircle';
      case 'error':
        return 'ExclamationTriangle';
      default:
        return 'InfoCircle';
    }
  }, [severity]);

  return (
    <Collapsible
      data-severity={severity}
      data-variant={variant}
      open={true}
      {...rest}
    >
      <div className="RosenAlert-icon">
        <Icon name={icon} size="medium" />
      </div>
      <div className="RosenAlert-content">{children}</div>
      <div className="RosenAlert-action">{action}</div>
    </Collapsible>
  );
};

Alert.displayName = 'Alert';
