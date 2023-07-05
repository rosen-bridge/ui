import { EventHandler, ReactNode, SyntheticEvent } from 'react';

import { Times } from '@rosen-bridge/icons';
import { Alert, AlertProps, Collapse, IconButton, SvgIcon } from '../base';

export interface AlertCardProps {
  severity: AlertProps['severity'] | null;
  onClose: EventHandler<SyntheticEvent>;
  children: ReactNode;
}
/**
 * render a collapse with an alert inside
 *
 * @param severity
 * @param onClose
 * @param children
 */
export const AlertCard = ({ severity, onClose, children }: AlertCardProps) => {
  return (
    <Collapse in={!!severity}>
      <Alert
        severity={severity || undefined}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            className="close-button"
            onClick={onClose}
          >
            <SvgIcon>
              <Times />
            </SvgIcon>
          </IconButton>
        }
        variant="filled"
        sx={{ mb: 2 }}
      >
        {children}
      </Alert>
    </Collapse>
  );
};
