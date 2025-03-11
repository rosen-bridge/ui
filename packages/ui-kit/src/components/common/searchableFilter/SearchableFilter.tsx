import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ClickAwayListener, Popper } from '@mui/material';

import { styled } from '../../../styling';
import { Chips, ChipsProps } from './Chips';
import { Picker } from './Picker';
import { Flow, Input, Selected } from './types';

const Root = styled('div')(() => ({}));

const Container = styled('div')(() => ({
  'display': 'flex',
  'alignItems': 'center',
  'border': 'solid 1px lightgray',
  'borderRadius': '2px',
  'background': 'white',
  'padding': '0.25rem 0.25rem',
  'input': {
    border: 'none',
    flexGrow: 1,
    outline: 0,
    background: 'transparent',
    padding: '0.25rem',
  },
  '.MuiChip-root': {
    borderRadius: 0,
  },
}));

const PickerRoot = styled('div')(() => ({
  border: '1px solid lightgray',
  borderRadius: 1,
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
  const [anchorElement, setAnchorElement] = useState<HTMLElement>();

  const [current, setCurrent] = useState<Partial<Selected>>();

  const [query, setQuery] = useState('');

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
          case 'multiple':
            if (!Array.isArray(current.value) || !current.value.length) return;

            for (let i = 0; i < current.value.length; i++) {
              const value = current.value[i];

              const option = input.options.find(
                (option) => option.value === value,
              );

              if (!option) return;
            }

            break;
          case 'select': {
            const option = input.options.find(
              (option) => option.value === current.value,
            );

            if (!option) return;

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

      if (!Object.hasOwn(current, 'flow')) return labels;

      const flow = flows.find((flow) => flow.name === current.flow)!;

      labels.push(flow.label);

      if (!Object.hasOwn(current, 'operator')) return labels;

      const operator = flow.operators.find(
        (operator) => operator.value == current.operator,
      )!;

      labels.push(operator.label);

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
      }

      return labels;
    });
  }, [flows, selectedValidatedWithCurrent]);

  const pickerRaw = useMemo<Input | undefined>(() => {
    if (!current) {
      return {
        type: 'select',
        options: flows
          .filter((flow) => {
            return (
              !flow.unique ||
              !selectedValidated.find((item) => item.flow == flow.name)
            );
          })
          .map((flow) => {
            return {
              label: flow.label,
              value: flow.name,
              post: flow.post,
              pre: flow.pre,
            };
          }),
      };
    }

    const flow = flows.find((flow) => flow.name === current.flow)!;

    if (!Object.hasOwn(current, 'operator')) {
      return {
        type: 'select',
        options: flow.operators,
      };
    }

    if (!Object.hasOwn(current, 'value')) {
      const context = {
        operator: current.operator!,
      };

      const input =
        typeof flow.input === 'function' ? flow.input(context) : flow.input;

      return input;
    }
  }, [current, selectedValidated, flows]);

  const picker = useMemo<Input | undefined>(() => {
    if (!query) return pickerRaw;
    switch (pickerRaw?.type) {
      case 'multiple':
      case 'select':
        return {
          ...pickerRaw,
          options: pickerRaw.options.filter((option) => {
            return option.value.toLowerCase().includes(query.toLowerCase());
          }),
        };
      default:
        return pickerRaw;
    }
  }, [query, pickerRaw]);

  useEffect(() => {
    if (pickerRaw == undefined) return;
    if (pickerRaw.type != 'select') return;
    if (pickerRaw.options.length != 1) return;
    handleSelect(pickerRaw.options.at(0)!.value);
  }, [pickerRaw]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleClose = () => {
    setAnchorElement(undefined);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (query) return;

    if (event.key != 'Delete' && event.key != 'Backspace') return;

    if (!current) {
      if (!selectedValidated.length) return;

      const last = selectedValidated.at(-1)!;

      setCurrent({
        flow: last.flow,
        operator: last.operator,
      });

      setAnchorElement(event.currentTarget);

      onChange(selectedValidated.slice(0, -1));

      return;
    }

    if (Object.hasOwn(current, 'value')) {
      setCurrent({
        flow: current.flow,
        operator: current.operator,
      });
      return;
    }

    if (Object.hasOwn(current, 'operator')) {
      setCurrent({
        flow: current.flow,
      });
      return;
    }

    setCurrent(undefined);
  };

  const handleSelect = (value: Selected['value']) => {
    anchorElement?.focus({ preventScroll: true });

    if (!current) {
      return setCurrent({ flow: value as string });
    }

    if (!Object.hasOwn(current, 'operator')) {
      return setCurrent({ ...current, operator: value as string });
    }

    if (!Object.hasOwn(current, 'value')) {
      setCurrent(undefined);

      onChange([...selectedValidated, { ...current, value } as Selected]);
    }
  };

  return (
    <>
      <div>
        <br />
        <br />
        <br />
        <ClickAwayListener onClickAway={handleClose}>
          <Root>
            <Container>
              <Chips value={chips} />
              <input
                value={query}
                autoComplete="off"
                onChange={handleChange}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
              />
            </Container>
            <Popper
              anchorEl={anchorElement}
              open={Boolean(anchorElement) && !!picker}
              placement="bottom-start"
              modifiers={[
                {
                  name: 'offset',
                  options: {
                    offset: [0, 5],
                  },
                },
              ]}
            >
              {picker && (
                <PickerRoot>
                  <Picker value={picker} onSelect={handleSelect} />
                </PickerRoot>
              )}
            </Popper>
          </Root>
        </ClickAwayListener>
        <br />
        <br />
        <br />
      </div>
    </>
  );
};
