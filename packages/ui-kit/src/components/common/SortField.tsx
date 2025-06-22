import { ChangeEvent, useCallback, useEffect } from 'react';

import { SortAmountDown, SortAmountUp } from '@rosen-bridge/icons';

import { styled } from '../../styling';
import {
  Divider,
  Grid,
  IconButton,
  MenuItem,
  SvgIcon,
  TextField,
} from '../base';

const Field = styled(TextField)(({ theme }) => ({
  '.MuiSelect-icon': {
    right: theme.spacing(10),
  },
  '.MuiInputBase-root': {
    backgroundColor: theme.palette.background.paper,
  },
  'fieldset': {
    border: 'none',
  },
}));

export type SortValue = {
  key?: string;
  order?: 'ASC' | 'DESC';
};

export type SortOption = {
  label: string;
  value: string;
};

export type SortFieldProps = {
  defaultKey?: SortValue['key'];
  defaultOrder?: SortValue['order'];
  disabled?: boolean;
  options: SortOption[];
  value?: SortValue;
  onChange?: (value?: SortValue) => void;
};

export const SortField = ({
  defaultKey,
  defaultOrder,
  disabled,
  options,
  value,
  onChange,
}: SortFieldProps) => {
  const handleSortChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.({ key: event.target.value });
    },
    [onChange],
  );

  const handleSortOrderChange = useCallback(() => {
    const next = value || {};

    next.order = next.order == 'ASC' ? 'DESC' : 'ASC';

    onChange?.({ ...next });
  }, [value, onChange]);

  useEffect(() => {
    if (!onChange) return;

    if (!defaultKey && !defaultOrder) return;

    onChange({
      key: defaultKey,
      order: defaultOrder,
    });
  }, [defaultKey, defaultOrder, onChange]);

  return (
    <Field
      disabled={disabled}
      select
      fullWidth
      SelectProps={{
        MenuProps: {
          PaperProps: {
            style: {
              marginTop: '4px',
            },
          },
        },
      }}
      value={value?.key || ''}
      style={{ minWidth: 250 }}
      InputProps={{
        endAdornment: (
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            wrap="nowrap"
            width="auto"
            gap={1}
          >
            <Grid item alignSelf="stretch">
              <Divider orientation="vertical" />
            </Grid>
            <Grid item>
              <IconButton disabled={disabled} onClick={handleSortOrderChange}>
                <SvgIcon>
                  {value?.order == 'ASC' ? (
                    <SortAmountDown />
                  ) : (
                    <SortAmountUp />
                  )}
                </SvgIcon>
              </IconButton>
            </Grid>
          </Grid>
        ),
      }}
      onChange={handleSortChange}
    >
      {options.map((item) => (
        <MenuItem key={item.value} value={item.value}>
          {item.label}
        </MenuItem>
      ))}
    </Field>
  );
};
