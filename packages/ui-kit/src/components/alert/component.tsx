import React, { useMemo } from 'react';

import { Icon } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlertOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type AlertOwnProps = {
  severity?: 'info' | 'success' | 'warning' | 'error';
  children?: React.ReactNode;
  action?: React.ReactNode;
};

export type AlertBaseProps = ElementBaseProps<'div', AlertOwnProps>;

export type AlertProps = OverridableType<AlertBaseProps, AlertOverrides, never>;

export const AlertBase = ({ severity='info', children,action, ...props }: AlertProps) => {
  const statusIcon = useMemo(() => {
    switch (severity) {
      case 'success':
        return <Icon name="CheckCircle" size="medium" />;
      case 'warning':
        return <Icon name="InfoCircle" size="medium" />;
      case 'error':
        return <Icon name="ExclamationTriangle" size="medium" />;
      default:
        return <Icon name="InfoCircle" size="medium" />;
    }
  }, [severity]);

  return (
    <div {...props} data-alert-severity={severity} className="RosenAlert-root" >
      <div className="RosenAlert-icon">{statusIcon}</div>
      <div className="RosenAlert-content">{children}</div>
      <div className="RosenAlert-action">{action}</div>
    </div>
  );
};

AlertBase.displayName = 'Alert';

export const Alert = Wrap(AlertBase);

// TODO
// export { Alert } from '@mui/material';
// export type { AlertProps } from '@mui/material';

// <Alert
//   severity="warning"
//   onClose={() => setAlertData(null)}
//   style={{
//     textAlign: 'justify',
//   }}
//   sx={{
//     '@container (max-width: 480px)': {
//       'display': 'grid',
//       'gridTemplateColumns': 'auto 1fr',
//       '.MuiAlert-action': {
//         gridColumn: '2',
//         gridRow: '2',
//       },
//     },
//   }}
//   action={
//     <Button size="small" onClick={() => setIsOpen(true)}>
//       SET API KEY
//     </Button>
//   }
// >

// export interface AlertCardProps {
//   severity: AlertProps['severity'] | null;
//   onClose?: EventHandler<SyntheticEvent>;
//   children: ReactNode;
// }

// export const AlertCard = ({
//   severity,
//   onClose,
//   children,
// }: AlertCardProps) => {
//   return (
//     <Collapsible open={!!severity}>
//       <Alert
//         severity={severity || undefined}
//         action={
//           onClose && (
//             <CloseButton
//               aria-label="close"
//               color="inherit"
//               size="small"
//               onClick={onClose}
//             />
//           )
//         }
//         variant="filled"
//       >
//         {children}
//       </Alert>
//     </Collapsible>
//   );
// };

// interface AlertProps {
//   variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
//   tone?: 'solid' | 'subtle' | 'outline';
//   size?: 'sm' | 'md' | 'lg';

//   title?: string;
//   description?: string;

//   icon?: boolean | HTMLElement;

//   dismissible?: boolean;
//   onClose?: () => void;

//   actions?: AlertAction[];

//   loading?: boolean;
//   progress?: number;

//   autoClose?: number; // ms

//   role?: 'alert' | 'status';
// }
