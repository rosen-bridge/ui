import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlertOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type AlertOwnProps = {};

export type AlertBaseProps = ElementBaseProps<'div', AlertOwnProps>;

export type AlertProps = OverridableType<AlertBaseProps, AlertOverrides, never>;

export const AlertBase = ({ ...rest }: AlertProps) => {
  return <div {...rest} />;
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
