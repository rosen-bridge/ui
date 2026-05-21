import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { useConfig } from '@/hooks';
import { OverridableType, ElementBaseProps } from '@/types';

import { Collapsible } from '../collapsible';
import { Icon, IconProps } from '../icon';
import { IconButton } from '../iconButton';
import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlertOverrides {}

export type AlertOwnProps = {
  action?: ReactNode;
  dismissible?: boolean;
  severity?: 'success' | 'info' | 'warning' | 'error';
  timeout?: number;
  variant?: 'filled' | 'outlined' | 'standard';
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
    variant = 'standard',
    onClose,
    ...rest
  } = useConfig('Alert', props);

  const [open, setOpen] = useState(true);

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

  const close = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (
      typeof timeout !== 'number' ||
      timeout <= 0 ||
      !Number.isFinite(timeout)
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setOpen(false);
      onClose?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onClose]);

  return (
    <Collapsible
      data-severity={severity}
      data-variant={variant}
      open={open}
      {...rest}
    >
      <div className="RosenAlert-inner">
        <div className="RosenAlert-icon">
          <Icon name={icon} size="medium" />
        </div>
        <div className="RosenAlert-content">{children}</div>
        <div className="RosenAlert-actions">
          {action}
          {dismissible && (
            <IconButton size="small" onClick={close}>
              <Icon name="Times" size="small" />
            </IconButton>
          )}
        </div>
      </div>
    </Collapsible>
  );
};

Alert.displayName = 'Alert';
