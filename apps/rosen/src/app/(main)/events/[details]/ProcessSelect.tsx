import { MouseEvent, useState } from 'react';

import { Button, Icon, Menu, MenuItem } from '@rosen-bridge/ui-kit';

const GUARDS = [{ key: '', label: 'Overall' }, ...JSON.parse(process.env['ALLOWED_PKS'] ?? '[]')] as Array<{ key: string; label: string; }>;

type ProcessSelectProps = {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const ProcessSelect = ({ disabled, value, onChange }: ProcessSelectProps) => {
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(
    null,
  );
  
  const open = !!anchorElement;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElement(null);
  };

  const handleSelect = (value: string) => () => {
    onChange(value);
    handleClose();
  };
 
  return (
    <>
      <Button
        disabled={disabled}
        endIcon={<Icon name="AngleDown" size="20px" />}
        size="small"
        onClick={handleClick}
      >
        {GUARDS.find((guard) => guard.key === value)?.label}
      </Button>
      <Menu
        anchorEl={anchorElement}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={handleClose}
        MenuListProps={{ dense: true }}
        slotProps={{
          paper: {
            elevation: 1,
            sx: { borderRadius: 0.5 },
          },
        }}
      >
        {GUARDS.map((guard) => (
          <MenuItem
            key={guard.key}
            selected={guard.key === value}
            onClick={handleSelect(guard.key)}
          >
            {guard.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
