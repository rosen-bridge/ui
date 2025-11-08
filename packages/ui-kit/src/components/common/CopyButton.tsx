import { HTMLAttributes, useCallback, useState } from 'react';

import { Check, Copy, Times } from '@rosen-bridge/icons';

import { IconButton, Tooltip } from '../base';
import { InjectOverrides } from './InjectOverrides';
import { SvgIcon } from './SvgIcon';

/**
 * `CopyButton` copies the given value to the clipboard.
 * Shows a success or error icon based on the copy result.
 */
export type CopyButtonProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Button size (`small` | `medium` | `large`).
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * The text value to copy.
   */
  value: string;
};

/**
 * A button that copies text to the clipboard and shows the status with an icon.
 */
const CopyButtonBase = ({
  size = 'medium',
  value,
  ...props
}: CopyButtonProps) => {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const getIcon = useCallback(() => {
    switch (status) {
      case 'success':
        return <Check />;
      case 'error':
        return <Times />;
      default:
        return <Copy />;
    }
  }, [status]);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 1500);
      })
      .catch(() => {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 1500);
      });
  }, [value]);

  return (
    <Tooltip title="Copy" {...props}>
      <IconButton size={size} onClick={handleCopy}>
        <SvgIcon size={size}>{getIcon()}</SvgIcon>
      </IconButton>
    </Tooltip>
  );
};

export const CopyButton = InjectOverrides(CopyButtonBase);
