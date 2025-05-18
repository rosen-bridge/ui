'use client';

import { ChangeEvent } from 'react';

import { styled } from '../../styling';
import { TextField, MenuItem, Typography, SvgIcon } from '../base';

type SelectedNetworkProps = {
  name: string;
  label: string;
  Logo: string;
};

interface NetworkSelectProps {
  id: string;
  label: string;
  value: string | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  options: SelectedNetworkProps[];
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const SelectedNetworkContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  marginBottom: '-1px',
}));

export const SelectedNetwork = ({
  label,
  Logo,
}: Omit<SelectedNetworkProps, 'name'>) => (
  <SelectedNetworkContainer>
    <SvgIcon>
      <Logo />
    </SvgIcon>
    <Typography color="text.secondary">{label}</Typography>
  </SelectedNetworkContainer>
);

/**
 * A general reusable network select field.
 */
export const IconSelectField = ({
  id,
  label,
  value,
  onChange,
  options,
  disabled,
  error,
  helperText,
}: NetworkSelectProps) => {
  const selected = options.find((opt) => opt.name === value);

  return (
    <TextField
      id={id}
      select
      label={label}
      value={value ?? ''}
      onChange={onChange}
      variant="filled"
      InputProps={{ disableUnderline: true }}
      disabled={disabled}
      error={error}
      helperText={helperText}
      SelectProps={{
        renderValue: () =>
          selected ? (
            <SelectedNetwork label={selected.label} Logo={selected.Logo} />
          ) : (
            ''
          ),
      }}
    >
      {options.map(({ name, label, Logo }) => (
        <MenuItem key={name} value={name}>
          <SelectedNetwork label={label} Logo={Logo} />
        </MenuItem>
      ))}
    </TextField>
  );
};
