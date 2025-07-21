import { Input, Operator } from './types';

export const OPERATOR_IS: Operator = {
  value: 'is',
  label: 'Is',
  preview: '=',
  post: '=',
  symbol: '=',
};

export const OPERATOR_NOT: Operator = {
  value: 'not',
  label: 'Not',
  preview: '!=',
  post: '!=',
  symbol: '!=',
};

export const OPERATOR_IS_NOT_ONE_OF: Operator = {
  value: 'is-not-one-of',
  label: 'Is not one of',
  preview: '!=',
  post: '!=',
  symbol: '!=',
};

export const OPERATOR_IS_ONE_OF: Operator = {
  value: 'is-one-of',
  label: 'Is one of',
  preview: '||',
  post: '||',
  symbol: '=',
};

export const OPERATOR_GREATER_THAN_OR_EQUAL: Operator = {
  value: 'greater-than-or-equal',
  label: 'Greater Than Or Equal',
  preview: '≥',
  post: '≥',
  symbol: '>=',
};

export const OPERATOR_LESS_THAN_OR_EQUAL: Operator = {
  value: 'less-than-or-equal',
  label: 'Less Than Or Equal',
  preview: '≤',
  post: '≤',
  symbol: '<=',
};

export const OPERATOR_CONTAINS: Operator = {
  value: 'contains',
  label: 'Contains',
  preview: '*',
  post: '*',
  symbol: '*=',
};

export const OPERATOR_STARTS_WITH: Operator = {
  value: 'startsWith',
  label: 'Starts With',
  preview: '→',
  post: '→',
  symbol: '^=',
};

export const OPERATOR_ENDS_WITH: Operator = {
  value: 'endsWith',
  label: 'Ends With',
  preview: '←',
  post: '←',
  symbol: '$=',
};

export const OPERATORS_COMPARATIVE: Operator[] = [
  OPERATOR_LESS_THAN_OR_EQUAL,
  OPERATOR_GREATER_THAN_OR_EQUAL,
];

export const OPERATORS_EQUALITY: Operator[] = [
  OPERATOR_IS,
  OPERATOR_NOT,
  OPERATOR_IS_NOT_ONE_OF,
  OPERATOR_IS_ONE_OF,
];

export const OPERATORS_STRING: Operator[] = [
  OPERATOR_CONTAINS,
  OPERATOR_STARTS_WITH,
  OPERATOR_ENDS_WITH,
];

export const VALUES_YESNO: Input = {
  type: 'select',
  options: [
    {
      value: 'yes',
      label: 'Yes',
    },
    {
      value: 'no',
      label: 'No',
    },
  ],
};
