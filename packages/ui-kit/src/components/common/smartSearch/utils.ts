import { Filter, Selected } from './types';

export const parseFilter = (filters: Filter[], current: Partial<Selected>) => {
  const filter = filters.find((filter) => filter.name === current.flow);

  if (!filter) return;

  const operator = filter.operators.find(
    (operator) => operator.value == current.operator,
  );

  if (!operator) return { flow: filter };

  if (!Object.hasOwn(current, 'value')) return { flow: filter, operator };

  const context = {
    operator: current.operator!,
  };

  const input =
    typeof filter.input === 'function' ? filter.input(context) : filter.input;

  switch (input.type) {
    case 'multiple': {
      return {
        flow: filter,
        operator,
        value: !Array.isArray(current.value)
          ? []
          : input.options
              .filter((option) => [current.value].flat().includes(option.value))
              .map((option) => option),
      };
    }
    case 'number': {
      return {
        flow: filter,
        operator,
        value: current.value as number,
      };
    }
    case 'select': {
      return {
        flow: filter,
        operator,
        value: input.options.find((option) => option.value === current.value),
      };
    }
    case 'text': {
      return {
        flow: filter,
        operator,
        value: current.value as string,
      };
    }
  }
};
