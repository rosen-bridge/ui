import { EventHandler, ReactNode, SyntheticEvent } from 'react';

import { Alert, AlertProps } from '../base';
import { CloseButton } from '../closeButton';
import { Button } from './Button';
import { Collapsible } from '../collapsible';

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
    <Collapsible open={!!severity}>
      <Alert
        severity={severity || undefined}
        action={
          onClose && (
            <CloseButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            />
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
    </Collapsible>
  );
};
