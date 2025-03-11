import { Input, Operator } from './types';

export const OPERATOR_BEEN: Operator = {
  value: 'is',
  label: 'Is',
  post: '=',
};

export const OPERATORS_EQUALITY: Operator[] = [
  OPERATOR_BEEN,
  {
    value: 'is-not-one-of',
    label: 'Is not one of',
    post: '!=',
  },
  {
    value: 'is-one-of',
    label: 'Is one of',
    post: '||',
  },
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
