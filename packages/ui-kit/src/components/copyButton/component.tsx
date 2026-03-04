import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { OverridableType } from '../../@types';
import { Tooltip } from '../base';
import { IconButton } from '../iconButton';
import { Icon, IconOverriddenProps } from '../icon';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CopyButtonOverrides { }

export type CopyButtonStatus = 'idle' | 'copying' | 'copied' | 'failed';

export type CopyButtonOwnProps = {
  /**
   * Icons to use for each status.
   */
  icons?: Record<CopyButtonStatus, IconOverriddenProps['name']>;

  /**
   * The text value to copy.
   */
  value?: string;
};

export type CopyButtonBaseProps = Omit<ElementBaseProps<typeof IconButton, CopyButtonOwnProps>, 'icon'>;

export type CopyButtonOverriddenProps = OverridableType<
  CopyButtonBaseProps,
  CopyButtonOverrides,
  never
>;

/**
 * A button that copies text to the clipboard and shows the status with an icon.
 */
export const CopyButtonBase = ({ icons, value = '', ...rest }: CopyButtonOverriddenProps) => {
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
    navigator.clipboard
      .writeText(value)
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
    // TODO: add tooltip and icon in slots
    <Tooltip title="Copy">
      <Root as={IconButton} onClick={handleCopy} {...rest}>
        <Icon name={icon} />
      </Root>
    </Tooltip>
  )
};

CopyButtonBase.displayName = 'CopyButton';

export const CopyButton = Wrap(CopyButtonBase);

export type CopyButtonProps = ComponentProps<typeof CopyButton>;
