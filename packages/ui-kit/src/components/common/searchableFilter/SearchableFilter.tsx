import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ClickAwayListener } from '@mui/material';

import { styled } from '../../../styling';
import { Chips, ChipsProps } from './Chips';
import { History } from './History';
import { Picker } from './Picker';
import { Flow, Input, Selected } from './types';

const Root = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
  border: 'solid 1px lightgray',
  borderRadius: '2px',
  background: 'white',
  padding: '0.25rem 0.25rem',
  input: {
    border: 'none',
    flexGrow: 1,
    outline: 0,
    background: 'transparent',
    padding: '0.25rem',
  },
}));

const Container = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
}));

export type SearchableFilterProps = {
  flows: Flow[];
  selected: Selected[];
  onChange: (selected: Selected[]) => void;
};

export const SearchableFilter = ({
  flows,
  selected,
  onChange,
}: SearchableFilterProps) => {
  const $anchor = useRef<HTMLInputElement | null>(null);

  const [current, setCurrent] = useState<Partial<Selected>>();

  const [query, setQuery] = useState('');

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
        const flow = flows.find((flow) => flow.name === current.flow);

        if (!flow) return;

        const operator = flow.operators.find(
          (operator) => operator.value == current.operator,
        );

        if (!operator) return;

        const context = {
          operator: current.operator,
        };

        const input =
          typeof flow.input === 'function' ? flow.input(context) : flow.input;

        switch (input.type) {
          case 'multiple': {
            if (!Array.isArray(current.value) || !current.value.length) return;

            for (let i = 0; i < current.value.length; i++) {
              const value = current.value[i];

              const option = input.options.find(
                (option) => option.value === value,
              );

              if (!option) return;
            }

            break;
          }

          case 'select': {
            const option = input.options.find(
              (option) => option.value === current.value,
            );

            if (!option) return;

            break;
          }

          case 'text': {
            break;
          }
        }

        return current;
      })
      .filter(Boolean) as Selected[];
  }, [flows, selected]);

  const selectedValidatedWithCurrent = useMemo<Partial<Selected>[]>(() => {
    return current ? [...selectedValidated, current] : selectedValidated;
  }, [current, selectedValidated]);

  const chips = useMemo<ChipsProps['value']>(() => {
    return selectedValidatedWithCurrent.map((current) => {
      const labels = [] as (string | string[])[];

      const flow = flows.find((flow) => flow.name === current.flow);

      if (!flow) return labels;

      labels.push(flow.label);

      const operator = flow.operators.find(
        (operator) => operator.value == current.operator,
      );

      if (!operator) return labels;

      labels.push(operator.label);

      if (!operator) return labels;

      if (!Object.hasOwn(current, 'value')) return labels;

      const context = {
        operator: current.operator!,
      };

      const input =
        typeof flow?.input === 'function' ? flow.input(context) : flow?.input;

      switch (input?.type) {
        case 'multiple': {
          const options = input.options
            .filter((option) => [current.value].flat().includes(option.value))
            .map((option) => option.label);

          labels.push(options);

          break;
        }
        case 'select': {
          const option = input.options.find(
            (option) => option.value === current.value,
          )!;

          labels.push(option.label);

          break;
        }
        case 'text': {
          labels.push(current.value as string);
          break;
        }
      }

      return labels;
    });
  }, [flows, selectedValidatedWithCurrent]);

  const pickerRaw = useMemo<Input | undefined>(() => {
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

  const picker = useMemo<Input | undefined>(() => {
    if (!query) return pickerRaw;

    switch (pickerRaw?.type) {
      case 'multiple':
      case 'select': {
        return {
          ...pickerRaw,
          options: pickerRaw.options.filter((option) => {
            return option.value.toLowerCase().includes(query.toLowerCase());
          }),
        };
      }
      default: {
        return pickerRaw;
      }
    }
  }, [query, pickerRaw]);

  const change = useCallback(() => {
    setQuery('');

    setCurrent({});

    const next = [...selectedValidated, current as Selected];

    onChange(next);
  }, [current, selectedValidated, onChange]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleClose = () => {
    setCurrent(undefined);

    if (!Array.isArray(current?.value)) return;

    if (!current?.value.length) return;

    change();
  };

  const handleFocus = () => {
    setCurrent({});
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter': {
        if (picker?.type === 'text') {
          setCurrent({ ...current, value: query });
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

            onChange(selectedValidated.slice(0, -1));

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
      if (state == 'idle') return;

      $anchor.current?.focus({ preventScroll: true });

      setCurrent(Object.assign({}, current, { [state]: value }));
    },
    [current, state],
  );

  useEffect(() => {
    if (state != 'complete') return;

    if (pickerRaw?.type == 'multiple') return;

    change();
  }, [current, pickerRaw, selectedValidated, state, change, onChange]);

  useEffect(() => {
    if (pickerRaw?.type == 'select' && pickerRaw?.options.length == 1) {
      handleSelect(pickerRaw.options.at(0)!.value);
    }
  }, [pickerRaw, handleSelect]);

  return (
    <>
      <Root>
        <History />
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
              onChange={handleChange}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
            />
            <Picker
              anchorEl={$anchor.current}
              open={!!picker}
              value={picker}
              onSelect={handleSelect}
            />
          </Container>
        </ClickAwayListener>
      </Root>
    </>
  );
};
