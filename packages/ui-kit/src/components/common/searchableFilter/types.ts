import { ReactNode } from 'react';

export type Context = {
  operator: string;
};

export type Operator = {
  value: string;
  label: string;
  pre?: ReactNode;
  post?: ReactNode;
};

export type Input =
  | {
      type: 'multiple';
      options: SelectOption[];
    }
  | {
      type: 'select';
      options: SelectOption[];
    }
  | {
      type: 'text';
    };

export type SelectOption = {
  value: string;
  label: string;
  pre?: ReactNode;
  post?: ReactNode;
};

export type Flow = {
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
  value: string | number | boolean | Array<string | number>;
};
