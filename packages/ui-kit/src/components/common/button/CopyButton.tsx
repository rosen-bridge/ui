import { useCallback, useState } from 'react';

import { Check, Copy, Times } from '@rosen-bridge/icons';

import { IconButton, SvgIcon, Tooltip } from '../../base';

interface CopyButtonProps {
  value: string;
  size?: 'small' | 'medium' | 'large';
}

export const CopyButton = ({ value, size = 'medium' }: CopyButtonProps) => {
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
    <Tooltip title="Copy">
      <IconButton size={size} onClick={handleCopy}>
        <SvgIcon fontSize={size}>{getIcon()}</SvgIcon>
      </IconButton>
    </Tooltip>
  );
};
