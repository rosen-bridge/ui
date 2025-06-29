import { Copy } from '@rosen-bridge/icons';
import { IconButton, SvgIcon, Tooltip, useSnackbar } from '@rosen-bridge/ui-kit';


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
    <Tooltip title="Copy">
      <IconButton size={size} onClick={handleCopy}>
        <SvgIcon fontSize={size}>
          <Copy />
        </SvgIcon>
      </IconButton>
    </Tooltip>
  );
};