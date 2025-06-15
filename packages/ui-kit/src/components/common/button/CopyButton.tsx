import { Copy } from '@rosen-bridge/icons';

import { useSnackbar } from '../../../hooks';
import { IconButton, SvgIcon } from '../../base';

interface CopyButtonProps {
  value: string;
  title?: string;
  size?: 'small' | 'medium' | 'large';
}

export const CopyButton = ({
  value,
  title,
  size = 'medium',
}: CopyButtonProps) => {
  const { openSnackbar } = useSnackbar();

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(
      () => {
        if (title) openSnackbar(title + ' copied.', 'info');
      },
      () => {
        openSnackbar('Failed to copy!', 'error');
      },
    );
  };
  return (
    <IconButton size={size} onClick={handleCopy}>
      <SvgIcon fontSize={size}>
        <Copy />
      </SvgIcon>
    </IconButton>
  );
};
