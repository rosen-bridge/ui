import { HTMLAttributes, useCallback, useEffect, useMemo } from 'react';

import { Card, styled } from '@mui/material';

import {
  Button,
  Menu,
  MenuBody,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuTrigger,
} from '@/components';
import { useMenu } from '@/hooks';

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
  const handleMenu = useMenu();

  const current = useMemo(() => {
    return options.find((option) => option.value === value?.key);
  }, [options, value]);

  const handleSortOrderChange = useCallback(() => {
    const next = value || {};

    next.order = next.order == 'ASC' ? 'DESC' : 'ASC';

    onChange?.({ ...next });
  }, [value, onChange]);

  const handleSortChange = useCallback(
    (option: SortOption) => {
      const next = value || { order: defaultOrder };

      next.key = option.value;

      onChange?.({ ...next });
    },
    [defaultOrder, value, onChange],
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
        <MenuTrigger as={IconButton} disabled={disabled} handle={handleMenu}>
          <Icon name="ListUiAlt" />
        </MenuTrigger>
      ) : (
        <MenuTrigger
          as={Button}
          disabled={disabled}
          endIcon={<Icon name="CaretDown" size="small" />}
          handle={handleMenu}
          style={{
            whiteSpace: 'nowrap',
            textTransform: 'none',
            color: 'inherit',
            width: '100%',
            justifyContent: 'space-between',
            padding: '2px 8px',
          }}
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
        </MenuTrigger>
      )}
      <Menu handle={handleMenu}>
        <MenuBody placement="bottom-start" offset={[-4, 12]}>
          <MenuGroup>
            <MenuGroupLabel
              style={{
                display: dense ? 'flex' : 'none',
                backgroundColor: 'transparent',
              }}
            >
              <Typography variant="caption" color="text-secondary">
                Sort by
              </Typography>
            </MenuGroupLabel>
            {options.map((item) => (
              <MenuItem
                style={{ display: 'flex', flexDirection: 'row' }}
                key={item.value}
                onClick={() => handleSortChange(item)}
              >
                {item.label}
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
          </MenuGroup>
        </MenuBody>
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
