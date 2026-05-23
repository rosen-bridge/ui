import { ReactNode, useCallback, useEffect, useMemo } from 'react';

import { Alert as AlertMUI } from '@mui/material';

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
  open?: boolean;
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
    open = true,
    severity = 'success',
    timeout,
    variant = 'standard',
    onClose,
    ...rest
  } = useConfig('Alert', props);

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
      onClose?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onClose]);

  void action;
  void icon;

  return (
    <Collapsible
      data-severity={severity}
      data-variant={variant}
      open={open}
      {...rest}
    >
      <AlertMUI
        severity={severity}
        action={
          dismissible && (
            <IconButton size="small" onClick={close}>
              <Icon name="Times" size="small" />
            </IconButton>
          )
        }
        variant="filled"
      >
        {children}
      </AlertMUI>
    </Collapsible>
  );
};

Alert.displayName = 'Alert';
