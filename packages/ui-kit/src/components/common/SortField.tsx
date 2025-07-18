import {
  HTMLAttributes,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AngleDown,
  AngleUp,
  ListUiAlt,
  SortAmountDown,
  SortAmountUp,
} from '@rosen-bridge/icons';

import { styled } from '../../styling';
import {
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  SvgIcon,
} from '../base';

const Root = styled(Card)(({ theme }) => ({
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
      onChange?.({ key: option.value });
    },
    [handleMenuClose, onChange],
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
      <Grid container alignItems="center" wrap="nowrap" width="auto" gap={1}>
        <Grid item flexGrow={1}>
          {dense ? (
            <IconButton disabled={disabled} onClick={handleMenuOpen}>
              <SvgIcon>
                <ListUiAlt />
              </SvgIcon>
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
              }}
              endIcon={<SvgIcon>{open ? <AngleUp /> : <AngleDown />}</SvgIcon>}
              onClick={handleMenuOpen}
            >
              {current?.label}
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
            {options.map((item) => (
              <MenuItem
                key={item.value}
                value={item.value}
                onClick={() => handleSortChange(item)}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Grid>
        <Grid item alignSelf="stretch">
          <Divider orientation="vertical" />
        </Grid>
        <Grid item>
          <IconButton disabled={disabled} onClick={handleSortOrderChange}>
            <SvgIcon>
              {value?.order == 'ASC' ? <SortAmountDown /> : <SortAmountUp />}
            </SvgIcon>
          </IconButton>
        </Grid>
      </Grid>
    </Root>
  );
};
