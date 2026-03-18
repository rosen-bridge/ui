import {
  HTMLAttributes,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Button, Card } from '@mui/material';

import { styled } from '../../styling';
import { ListItemText, ListSubheader, Menu, MenuItem } from '../base';
import { Icon } from '../icon';
import { IconButton } from '../iconButton';
import { Stack } from '../stack';
import { Typography } from '../typography';
import { Divider } from './Divider';

const Root = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 0.5),
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
  dense?: boolean;
  disabled?: boolean;
  options: SortOption[];
  value?: SortValue;
  onChange?: (value?: SortValue) => void;
} & HTMLAttributes<HTMLDivElement>;

export const SortField = ({
  defaultKey,
  defaultOrder,
  dense,
  disabled,
  options,
  value,
  onChange,
  ...rest
}: SortFieldProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const current = useMemo(() => {
    return options.find((option) => option.value === value?.key);
  }, [options, value]);

  const handleSortOrderChange = useCallback(() => {
    const next = value || {};

    next.order = next.order == 'ASC' ? 'DESC' : 'ASC';

    onChange?.({ ...next });
  }, [value, onChange]);

  const handleMenuOpen = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSortChange = useCallback(
    (option: SortOption) => {
      handleMenuClose();

      const next = value || { order: defaultOrder };

      next.key = option.value;

      onChange?.({ ...next });
    },
    [defaultOrder, value, handleMenuClose, onChange],
  );

  useEffect(() => {
    if (!onChange) return;

    if (!defaultKey && !defaultOrder) return;

    onChange({
      key: defaultKey,
      order: defaultOrder,
    });
  }, [defaultKey, defaultOrder, onChange]);

  return (
    <Root {...rest}>
      {dense ? (
        <IconButton disabled={disabled} onClick={handleMenuOpen}>
          <Icon name="ListUiAlt" />
        </IconButton>
      ) : (
        <Button
          disabled={disabled}
          style={{
            whiteSpace: 'nowrap',
            textTransform: 'none',
            color: 'inherit',
            width: '100%',
            justifyContent: 'space-between',
            padding: '2px 8px',
          }}
          endIcon={
            <Icon
              name="CaretDown"
              style={{ rotate: open ? '180deg' : '0deg' }}
            />
          }
          onClick={handleMenuOpen}
        >
          <Stack align="start">
            <Typography
              hidden={dense}
              variant="caption"
              color="text-secondary"
              lineHeight="12px"
            >
              Sort by
            </Typography>
            <Typography variant="body1" lineHeight="24px">
              {current?.label}
            </Typography>
          </Stack>
        </Button>
      )}
      <Menu
        anchorEl={anchorEl}
        open={open}
        PaperProps={{
          style: {
            marginTop: 12,
            marginLeft: -4,
          },
        }}
        onClose={handleMenuClose}
      >
        <ListSubheader
          style={{
            display: dense ? 'flex' : 'none',
            backgroundColor: 'transparent',
          }}
        >
          <Typography variant="caption" color="text-secondary">
            Sort by
          </Typography>
        </ListSubheader>
        {options.map((item) => (
          <MenuItem
            key={item.value}
            value={item.value}
            onClick={() => handleSortChange(item)}
          >
            <ListItemText> {item.label}</ListItemText>
            <Icon
              name="Check"
              style={{
                display:
                  dense && current && item.value === current.value
                    ? 'flex'
                    : 'none',
              }}
            />
          </MenuItem>
        ))}
      </Menu>
      <div style={{ alignSelf: 'stretch' }}>
        <Divider orientation="vertical" />
      </div>
      <IconButton disabled={disabled} onClick={handleSortOrderChange}>
        <Icon
          name={value?.order == 'ASC' ? 'SortAmountDown' : 'SortAmountUp'}
        />
      </IconButton>
    </Root>
  );
};
