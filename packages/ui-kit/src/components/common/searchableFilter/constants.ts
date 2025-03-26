import { Input, Operator } from './types';

export const OPERATOR_IS: Operator = {
  value: 'is',
  label: 'Is',
  symbol: '=',
};

export const OPERATOR_NOT: Operator = {
  value: 'not',
  label: 'Not',
  symbol: '!=',
};

export const OPERATOR_IS_NOT_ONE_OF: Operator = {
  value: 'is-not-one-of',
  label: 'Is not one of',
  symbol: '!=',
};

export const OPERATOR_IS_ONE_OF: Operator = {
  value: 'is-one-of',
  label: 'Is one of',
  symbol: '=',
};

export const OPERATORS_EQUALITY: Operator[] = [
  OPERATOR_IS,
  OPERATOR_NOT,
  OPERATOR_IS_NOT_ONE_OF,
  OPERATOR_IS_ONE_OF,
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
