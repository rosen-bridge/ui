import { EventHandler, ReactNode, SyntheticEvent } from 'react';

import { Times } from '@rosen-bridge/icons';

import { Alert, AlertProps, Collapse, IconButton } from '../base';
import { Button } from './Button';
import { SvgIcon } from './SvgIcon';

export interface AlertCardProps {
  severity: AlertProps['severity'] | null;
  onClose?: EventHandler<SyntheticEvent>;
  children: ReactNode;
  more?: () => string;
}

/**
 * render a collapse with an alert inside
 *
 * @param severity
 * @param onClose
 * @param children
 * @param more
 */
export const AlertCard = ({
  severity,
  onClose,
  children,
  more,
}: AlertCardProps) => {
  return (
    <Collapse in={!!severity}>
      <Alert
        severity={severity || undefined}
        action={
          onClose && (
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
          )
        }
        variant="filled"
      >
        {children}
        {!!more && (
          <>
            {' '}
            (
            <Button
              color="inherit"
              size="small"
              variant="text"
              style={{ padding: '5px', lineHeight: 'normal' }}
              onClick={() => {
                navigator.clipboard.writeText(more());
              }}
            >
              Copy Details
            </Button>
            )
          </>
        )}
      </Alert>
    </Collapse>
  );
};
