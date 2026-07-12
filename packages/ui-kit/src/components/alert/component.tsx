import { type ReactNode, useCallback, useEffect, useMemo } from 'react';

import { Alert as AlertMUI } from '@mui/material';

import { Collapsible, Icon, IconButton, type IconProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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
          <>
            {action}
            {dismissible && (
              <IconButton size="small" onClick={close}>
                <Icon name="Times" size="small" />
              </IconButton>
            )}
          </>
        }
        variant={variant}
      >
        {children}
      </AlertMUI>
    </Collapsible>
  );
};

Alert.displayName = 'Alert';
