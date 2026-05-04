'use client';

import { ReactNode } from 'react';

import {
  ListItemIcon,
  MenuItem,
  SvgIcon,
  TextField,
  Typography,
} from '@rosen-bridge/ui-kit';
import { Network } from '@rosen-network/base';

type Props = {
  id: string;
  label: string;
  value: string | null;
  disabled?: boolean;
  options: Network[];
  onChange: (value: string) => void;
  renderSelected: (value: unknown) => ReactNode;
};

export const NetworkSelectField = ({
  id,
  label,
  value,
  disabled,
  options,
  onChange,
  renderSelected,
}: Props) => {
  return (
    <TextField
      id={id}
      select
      label={label}
      disabled={disabled}
      slotProps={{
        input: {
          'aria-label': `${id} input`,
          'disableUnderline': true,
        },
        select: {
          renderValue: renderSelected,
        },
      }}
      variant="filled"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map(({ logo: Logo, ...network }) => (
        <MenuItem key={network.name} value={network.name}>
          <ListItemIcon>
            <SvgIcon>
              <Logo />
            </SvgIcon>
          </ListItemIcon>
          <Typography color="text.secondary">{network.label}</Typography>
        </MenuItem>
      ))}
    </TextField>
  );
};
