import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Card } from '@mui/material';
import { Search } from '@rosen-bridge/icons';

import { styled } from '../../../styling';
import { IconButton, SvgIconMui } from '../../base';
import { DividerNew } from '../DividerNew';
import { Chips } from './Chips';
import { History, HistoryRef } from './History';
import { Picker } from './Picker';
import { Filter, Input, Selected } from './types';
import { parseFilter } from './utils';
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

type SmartSearchState = 'idle' | 'flow' | 'operator' | 'value' | 'complete';

export type SmartSearchProps = {
  disabled?: boolean;
  filters: Filter[];
  namespace: string;
  onChange: (params: Record<string, unknown>) => void;
};

export const SmartSearch = ({
  disabled,
  filters: filtersInput,
  namespace,
  onChange,
}: SmartSearchProps) => {
  const $anchor = useRef<HTMLInputElement>(null);

  const $history = useRef<HistoryRef>(null);

  const $search = useRef<HTMLButtonElement>(null);

  const [current, setCurrent] = useState<Partial<Selected>>();

  const [filters, setFilters] = useState<Selected[]>([]);

  const [query, setQuery] = useState('');

  const [selected, setSelected] = useState<Selected[]>([]);

  const state = useMemo<SmartSearchState>(() => {
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
        const parsed = parseFilter(filtersInput, current);

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
  }, [filtersInput, selected]);

  const selectedValidatedWithCurrent = useMemo<Partial<Selected>[]>(() => {
    return current ? [...selectedValidated, current] : selectedValidated;
  }, [current, selectedValidated]);

  const picker = useMemo<Input | undefined>(() => {
    switch (state) {
      case 'idle': {
        return;
      }
      case 'flow': {
        return {
          type: 'select',
          options: filtersInput
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
        const flow = filtersInput.find((flow) => flow.name === current!.flow)!;

        return {
          type: 'select',
          options: flow.operators,
        };
      }
      case 'value': {
        const flow = filtersInput.find((flow) => flow.name === current!.flow)!;

        const context = {
          operator: current!.operator!,
        };

        const input =
          typeof flow.input === 'function' ? flow.input(context) : flow.input;

        return input;
      }
    }
  }, [current, filtersInput, selectedValidated, state]);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
    },
    [],
  );

  const handleInputFocus = useCallback(() => {
    setCurrent({});
  }, []);

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
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
                (filtersInput.find((flow) => flow.name == current!.flow)
                  ?.operators.length || 0) > 1;

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
    },
    [current, filtersInput, query, selected, selectedValidated, state],
  );

  const handlePickerSelect = useCallback(
    (value: Selected['value']) => {
      if (state == 'idle') return;

      if (!(state == 'value' && picker?.type == 'multiple')) {
        $anchor.current?.focus({ preventScroll: true });
      }

      const nextCurrent = Object.assign({}, current, { [state]: value });

      setCurrent(nextCurrent);

      if (state !== 'value') return;

      setCurrent({});

      const nextSelected = [...selectedValidated, nextCurrent as Selected];

      setSelected(nextSelected);
    },
    [current, picker, selectedValidated, state],
  );

  useEffect(() => {
    setQuery('');
  }, [current]);

  useEffect(() => {
    $search.current?.focus({ preventScroll: true });

    setCurrent(undefined);

    $history.current?.add(filters);

    const params: Record<string, unknown> = {};

    for (const item of filters) {
      const parsed = parseFilter(filtersInput, item)!;

      const operator = parsed.operator!.symbol;

      const array = Array.isArray(item.value) ? '[]' : '';

      const value = [item.value].flat().join(',');

      params[`${item.flow}${array}${operator.replace('=', '')}`] = value;
    }

    onChange(params);
  }, [filters, filtersInput, onChange]);

  return (
    <Root>
      <History
        disabled={disabled}
        filter={filtersInput}
        namespace={namespace}
        ref={$history}
        onSelect={(selected) => {
          setSelected(selected);
          setFilters(selected);
        }}
      />
      <DividerNew
        style={{ alignSelf: 'stretch', height: 'auto' }}
        orientation="vertical"
      />
      <VirtualScroll>
        <Container>
          <Chips
            filters={filtersInput}
            value={selectedValidatedWithCurrent}
            onRemove={(item) => {
              setCurrent(undefined);
              setSelected(selected.filter((_) => _ !== item));
            }}
          />
          <input
            disabled={disabled}
            ref={$anchor}
            value={query}
            autoComplete="off"
            placeholder={state === 'idle' ? 'Filter results that ... ' : ''}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
          />
          <Picker
            anchorEl={$anchor.current}
            query={query}
            open={!!picker}
            value={picker}
            onClose={() => {
              setCurrent(undefined);
            }}
            onSelect={handlePickerSelect}
          />
        </Container>
      </VirtualScroll>
      <IconButton
        disabled={disabled}
        ref={$search}
        onClick={() => setFilters(selected)}
      >
        <SvgIconMui>
          <Search />
        </SvgIconMui>
      </IconButton>
    </Root>
  );
};
