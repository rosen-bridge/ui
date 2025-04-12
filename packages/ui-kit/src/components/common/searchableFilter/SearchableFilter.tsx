import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Card,
  ClickAwayListener,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  SvgIcon,
  TextField,
} from '@mui/material';
import { Search, SortAmountDown, SortAmountUp } from '@rosen-bridge/icons';

import { styled } from '../../../styling';
import { Chips, ChipsProps } from './Chips';
import { History, HistoryRef } from './History';
import { Picker } from './Picker';
import { Flow, Input, Selected, Sort } from './types';
import { aaaaa } from './utils';
import { VirtualScroll } from './VirtualScroll';

const Root = styled(Card)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1, 0.5),
  input: {
    border: 'none',
    flexGrow: 1,
    outline: 0,
    background: 'transparent',
    padding: theme.spacing(1),
    fontSize: '1rem',
    lineHeight: 1.5,
    color: 'currentColor',
  },
}));

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 0.5),
}));

const SortTextField = styled(TextField)(({ theme }) => ({
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

export type SearchableFilterProps = {
  flows: Flow[];
  sortDefault?: Sort;
  sortItems?: Array<{ label: string; value: string }>;
  namespace: string;
  onChange: (result: {
    selected: Selected[];
    query: string;
    sort?: Sort;
  }) => void;
};

export const SearchableFilter = ({
  flows,
  sortDefault,
  sortItems,
  namespace,
  onChange,
}: SearchableFilterProps) => {
  const $anchor = useRef<HTMLInputElement>(null);

  const $history = useRef<HistoryRef>(null);

  const $search = useRef<HTMLButtonElement>(null);

  const timeout = useRef<number>();

  const [current, setCurrent] = useState<Partial<Selected>>();

  const [filters, setFilters] = useState<Selected[]>([]);

  const [query, setQuery] = useState('');

  const [selected, setSelected] = useState<Selected[]>([]);

  const [sort, setSort] = useState<Sort | undefined>(sortDefault);

  const state = useMemo<
    'idle' | 'flow' | 'operator' | 'value' | 'complete'
  >(() => {
    if (!current) return 'idle';

    if (!Object.hasOwn(current, 'flow')) return 'flow';

    if (!Object.hasOwn(current, 'operator')) return 'operator';

    if (!Object.hasOwn(current, 'value')) return 'value';

    if (Array.isArray(current.value)) return 'value';

    return 'complete';
  }, [current]);

  const selectedValidated = useMemo<Selected[]>(() => {
    return selected
      .map((current) => {
        const parsed = aaaaa(flows, current);

        if (!parsed) return;

        if (!parsed.flow) return;

        if (!parsed.operator) return;

        if (!parsed.value) return;

        if (Array.isArray(parsed.value)) {
          if (!Array.isArray(current.value)) return;
          if (!current.value.length) return;
          if (!parsed.value.length) return;
          if (parsed.value.length != current.value.length) return;
        }

        return current;
      })
      .filter(Boolean) as Selected[];
  }, [flows, selected]);

  const selectedValidatedWithCurrent = useMemo<Partial<Selected>[]>(() => {
    return current ? [...selectedValidated, current] : selectedValidated;
  }, [current, selectedValidated]);

  const chips = useMemo<ChipsProps['value']>(() => {
    return selectedValidatedWithCurrent
      .map((current) => {
        const labels = [] as (string | string[])[];

        const parsed = aaaaa(flows, current);

        if (!parsed) return labels;

        parsed.flow && labels.push(parsed.flow.label);

        parsed.operator && labels.push(parsed.operator.label);

        if (!Object.hasOwn(parsed, 'value')) return labels;

        [parsed.value].flat().forEach((value) => {
          if (typeof value == 'object' && 'label' in value) {
            labels.push(value.label);
          } else {
            labels.push(`${value}`);
          }
        });

        return labels;
      })
      .filter((item) => !!item.length);
  }, [flows, selectedValidatedWithCurrent]);

  const picker = useMemo<Input | undefined>(() => {
    switch (state) {
      case 'idle': {
        return;
      }
      case 'flow': {
        return {
          type: 'select',
          options: flows
            .filter(
              (flow) =>
                !flow.unique ||
                !selectedValidated.find((item) => item.flow == flow.name),
            )
            .map((flow) => ({
              label: flow.label,
              value: flow.name,
              post: flow.post,
              pre: flow.pre,
            })),
        };
      }
      case 'operator': {
        const flow = flows.find((flow) => flow.name === current!.flow)!;

        return {
          type: 'select',
          options: flow.operators,
        };
      }
      case 'value': {
        const flow = flows.find((flow) => flow.name === current!.flow)!;

        const context = {
          operator: current!.operator!,
        };

        const input =
          typeof flow.input === 'function' ? flow.input(context) : flow.input;

        return input;
      }
    }
  }, [current, flows, selectedValidated, state]);

  const change = useCallback(() => {
    setCurrent({});

    const next = [...selectedValidated, current as Selected];

    setSelected(next);
  }, [current, selectedValidated]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }, []);

  const handleClose = useCallback(() => {
    if (Array.isArray(current?.value) && current?.value.length) {
      change();
    }
    setCurrent(undefined);
  }, [current, change]);

  const handleBlur = useCallback(() => {
    clearTimeout(timeout.current);
    timeout.current = window.setTimeout(handleClose, 250);
  }, [handleClose]);

  const handleFocus = useCallback(() => {
    setCurrent({});
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter': {
        if (state == 'flow' && !query) {
          setFilters(selected);
        }
        break;
      }
      case 'Backspace':
      case 'Delete': {
        if (query) return;
        switch (state) {
          case 'idle':
          case 'flow': {
            if (!selectedValidated.length) return;

            const last = selectedValidated.at(-1)!;

            setCurrent({
              flow: last.flow,
              operator: last.operator,
            });

            setSelected(selectedValidated.slice(0, -1));

            break;
          }
          case 'operator': {
            setCurrent({});
            break;
          }
          case 'value': {
            const moreTwoSteps =
              (flows.find((flow) => flow.name == current!.flow)?.operators
                .length || 0) > 1;

            if (moreTwoSteps) {
              setCurrent({ flow: current!.flow });
            } else {
              setCurrent(undefined);
            }
            break;
          }
          case 'complete': {
            setCurrent({
              flow: current!.flow,
              operator: current!.operator,
            });
            break;
          }
        }
        break;
      }
    }
  };

  const handleSelect = useCallback(
    (value: Selected['value']) => {
      clearTimeout(timeout.current);

      if (state == 'idle') return;

      $anchor.current?.focus({ preventScroll: true });

      setCurrent(Object.assign({}, current, { [state]: value }));
    },
    [current, state],
  );

  const handleSortChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const key = event.target.value;

      const sort = { key };

      setSort(sort);
    },
    [],
  );

  const handleSortOrderChange = useCallback(() => {
    const next = sort || {};

    next.order = next.order == 'ASC' ? 'DESC' : 'ASC';

    setSort({ ...next });
  }, [sort]);

  useEffect(() => {
    setQuery('');
  }, [current]);

  useEffect(() => {
    if (state != 'complete') return;

    if (picker?.type == 'multiple') return;

    change();
  }, [picker, state, change]);

  useEffect(() => {
    setSort(sortDefault);
  }, [sortDefault]);

  useEffect(() => {
    $search.current?.focus({ preventScroll: true });

    setCurrent(undefined);

    $history.current?.add(filters);

    const query = filters
      .map((item) => {
        const parsed = aaaaa(flows, item)!;

        const operator = parsed.operator!.symbol;

        const array = Array.isArray(item.value) ? '[]' : '';

        const value = [item.value].flat().join(',');

        return `${item.flow}${array}${operator}${value}`;
      })
      .concat(
        sort ? [`sort=${sort.key}${sort.order ? '-' + sort.order : ''}`] : [],
      )
      .join('&');

    onChange({ query, selected: filters, sort });
  }, [filters, flows, sort, onChange]);

  return (
    <Grid alignItems="center" container gap={2}>
      <Grid item flexGrow={1}>
        <Root>
          <History
            flows={flows}
            namespace={namespace}
            ref={$history}
            onSelect={(selected) => {
              setSelected(selected);
              setFilters(selected);
            }}
          />
          <Divider orientation="vertical" flexItem />
          <VirtualScroll>
            <ClickAwayListener onClickAway={handleClose}>
              <Container>
                <Chips value={chips} />
                <input
                  ref={$anchor}
                  value={query}
                  autoComplete="off"
                  placeholder={
                    selectedValidatedWithCurrent.length
                      ? ''
                      : 'Search or filter results…'
                  }
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onKeyDown={handleKeyDown}
                />
                <Picker
                  anchorEl={$anchor.current}
                  query={query}
                  open={!!picker}
                  value={picker}
                  onSelect={handleSelect}
                />
              </Container>
            </ClickAwayListener>
          </VirtualScroll>
          <IconButton ref={$search} onClick={() => setFilters(selected)}>
            <SvgIcon>
              <Search />
            </SvgIcon>
          </IconButton>
        </Root>
      </Grid>
      <Grid item mobile={12} tablet="auto">
        <SortTextField
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
          value={sort?.key || ''}
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
                  <IconButton ref={$search} onClick={handleSortOrderChange}>
                    <SvgIcon>
                      {sort?.order == 'ASC' ? (
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
          {sortItems?.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </SortTextField>
      </Grid>
    </Grid>
  );
};
