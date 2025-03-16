import { Flow, Selected } from './types';

export const aaaaa = (flows: Flow[], current: Partial<Selected>) => {
  const flow = flows.find((flow) => flow.name === current.flow);

  if (!flow) return;

  const operator = flow.operators.find(
    (operator) => operator.value == current.operator,
  );

  if (!operator) return { flow };

  if (!Object.hasOwn(current, 'value')) return { flow, operator };

  const context = {
    operator: current.operator!,
  };

  const input =
    typeof flow.input === 'function' ? flow.input(context) : flow.input;

  switch (input.type) {
    case 'multiple': {
      return {
        flow,
        operator,
        value: !Array.isArray(current.value)
          ? []
          : input.options
              .filter((option) => [current.value].flat().includes(option.value))
              .map((option) => option),
      };
    }
    case 'select': {
      return {
        flow,
        operator,
        value: input.options.find((option) => option.value === current.value),
      };
    }
    case 'text': {
      return {
        flow,
        operator,
        value: current.value as string | number | boolean,
      };
    }
  }
};
