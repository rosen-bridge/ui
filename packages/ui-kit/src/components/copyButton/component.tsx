import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Icon, IconButton, type IconProps, Tooltip } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface CopyButtonOverrides {}

export type CopyButtonStatus = 'idle' | 'copying' | 'copied' | 'failed';

export type CopyButtonOwnProps = {
  /**
   * Icons to use for each status.
   */
  icons?: Record<CopyButtonStatus, IconProps['name']>;

  slots?: {
    icon?: IconProps;
  };

  /**
   * The text value to copy.
   */
  value?: string | (() => string | undefined);
};

export type CopyButtonBaseProps = ElementBaseProps<typeof IconButton, CopyButtonOwnProps>;

export type CopyButtonProps = OverridableType<CopyButtonBaseProps, CopyButtonOverrides, never>;

/**
 * A button that copies text to the clipboard and shows the status with an icon.
 */
export const CopyButton = (props: CopyButtonProps) => {
  const { icons, slots, value, disabled, ...rest } = useConfig(
    'CopyButton',
    props,
  );

  const [status, setStatus] = useState<CopyButtonStatus>('idle');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const icon = useMemo(() => {
    switch (status) {
      case 'idle':
        return icons?.idle || 'Copy';
      case 'copying':
        return icons?.copying || 'Copy';
      case 'copied':
        return icons?.copied || 'Check';
      case 'failed':
        return icons?.failed || 'CloseCircle';
    }
  }, [icons, status]);

  const isDisabled = Boolean(disabled || value === undefined || value === '');

  const handleCopy = useCallback(() => {
    const text = typeof value === 'function' ? value() : value;

    if (isDisabled || !text) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setStatus('copying');

    if (!navigator?.clipboard?.writeText) {
      setStatus('failed');
      timeoutRef.current = window.setTimeout(() => setStatus('idle'), 5000);
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setStatus('copied');
        timeoutRef.current = window.setTimeout(() => setStatus('idle'), 1500);
      })
      .catch(() => {
        setStatus('failed');
        timeoutRef.current = window.setTimeout(() => setStatus('idle'), 5000);
      });
  }, [value, isDisabled]);

  return (
    <Tooltip
      disabled={status !== 'failed'}
      title="The browser does not allow access to the clipboard"
    >
      <IconButton onClick={handleCopy} disabled={isDisabled} {...rest}>
        <Icon
          name={icon}
          color={status === 'failed' ? 'error' : undefined}
          {...slots?.icon}
        />
      </IconButton>
    </Tooltip>
  );
};

CopyButton.displayName = 'CopyButton';
