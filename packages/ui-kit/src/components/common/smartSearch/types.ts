import { ReactNode } from 'react';

export type Context = {
  operator: string;
};

export type Operator = {
  value: string;
  label: string;
  symbol: string;
  pre?: ReactNode;
  post?: ReactNode;
};

export type Input =
  | {
      type: 'multiple';
      options: SelectOption[];
    }
  | {
      type: 'number';
    }
  | {
      type: 'select';
      options: SelectOption[];
    }
  | {
      type: 'text';
    };

export type SelectOption = {
  value: boolean | null | number | string;
  label: string;
  pre?: ReactNode;
  post?: ReactNode;
};

export type Filter = {
  name: string;
  label: string;
  pre?: ReactNode;
  post?: ReactNode;
  unique?: boolean;
  operators: Operator[];
  input: Input | ((context: Context) => Input);
};

export type Selected = {
  flow: string;
  operator: string;
  value:
    | boolean
    | null
    | number
    | string
    | Array<boolean | null | number | string>;
};

export type Search = {
  query?: string;
  in?: string;
};
