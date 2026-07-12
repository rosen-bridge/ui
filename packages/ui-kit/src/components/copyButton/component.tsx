import { useCallback, useMemo, useState } from 'react';

import { Icon, IconButton, type IconProps } from '@/components';
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

export type CopyButtonBaseProps = ElementBaseProps<
  typeof IconButton,
  CopyButtonOwnProps
>;

export type CopyButtonProps = OverridableType<
  CopyButtonBaseProps,
  CopyButtonOverrides,
  never
>;

/**
 * A button that copies text to the clipboard and shows the status with an icon.
 */
export const CopyButton = (props: CopyButtonProps) => {
  const { icons, slots, value, ...rest } = useConfig('CopyButton', props);

  const [status, setStatus] = useState<CopyButtonStatus>('idle');

  const icon = useMemo(() => {
    switch (status) {
      case 'idle':
        return icons?.idle || 'Copy';
      case 'copying':
        return icons?.copying || 'Copy';
      case 'copied':
        return icons?.copied || 'Check';
      case 'failed':
        return icons?.failed || 'Times';
    }
  }, [icons, status]);

  const handleCopy = useCallback(() => {
    setStatus('copying');

    const text = typeof value === 'function' ? value() : value;

    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setStatus('copied');
        setTimeout(() => setStatus('idle'), 1500);
      })
      .catch(() => {
        setStatus('failed');
        setTimeout(() => setStatus('idle'), 1500);
      });
  }, [value]);

  return (
    <IconButton onClick={handleCopy} {...rest}>
      <Icon name={icon} {...slots?.icon} />
    </IconButton>
  );
};

CopyButton.displayName = 'CopyButton';
