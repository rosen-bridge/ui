import { ComponentProps, useCallback, useMemo, useState } from 'react';

import { OverridableType } from '@/types';
import { Icon, IconButton, IconOverriddenProps } from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CopyButtonOverrides {}

export type CopyButtonStatus = 'idle' | 'copying' | 'copied' | 'failed';

export type CopyButtonOwnProps = {
  /**
   * Icons to use for each status.
   */
  icons?: Record<CopyButtonStatus, IconOverriddenProps['name']>;

  slots?: {
    icon?: IconOverriddenProps;
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

export type CopyButtonOverriddenProps = OverridableType<
  CopyButtonBaseProps,
  CopyButtonOverrides,
  never
>;

/**
 * A button that copies text to the clipboard and shows the status with an icon.
 */
export const CopyButtonBase = ({
  icons,
  slots,
  value,
  ...rest
}: CopyButtonOverriddenProps) => {
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
    <Root as={IconButton} onClick={handleCopy} {...rest}>
      <Icon name={icon} {...slots?.icon} />
    </Root>
  );
};

CopyButtonBase.displayName = 'CopyButton';

export const CopyButton = Wrap(CopyButtonBase);

export type CopyButtonProps = ComponentProps<typeof CopyButton>;
