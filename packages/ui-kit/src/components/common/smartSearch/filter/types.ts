import {
  FILTER_FIELD_NUMBER_OPERATORS,
  FILTER_FIELD_STRING_OPERATORS,
  FILTER_FIELD_STRING_ARRAY_OPERATORS,
} from './constants';

/**
 * Field
 */

export type NumberFilterField = {
  key: string;
  type: 'number';
  operator: (typeof FILTER_FIELD_NUMBER_OPERATORS)[number];
  value: number;
};

export type NumberFilterFieldConfig = {
  key: string;
  type: 'number';
  operators?: NumberFilterField['operator'][];
};

export type StringFilterField = {
  key: string;
  type: 'string';
  operator: (typeof FILTER_FIELD_STRING_OPERATORS)[number];
  value: string;
};

export type StringFilterFieldConfig = {
  key: string;
  type: 'string';
  operators?: StringFilterField['operator'][];
  values?: string[];
};

export type StringArrayFilterField = {
  key: string;
  type: 'stringArray';
  operator: (typeof FILTER_FIELD_STRING_ARRAY_OPERATORS)[number];
  values: string[];
};

export type StringArrayFilterFieldConfig = {
  key: string;
  type: 'stringArray';
  operators?: StringArrayFilterField['operator'][];
  values?: string[];
};

export type FilterField =
  | NumberFilterField
  | StringFilterField
  | StringArrayFilterField;

export type FilterFieldConfig =
  | NumberFilterFieldConfig
  | StringFilterFieldConfig
  | StringArrayFilterFieldConfig;

/**
 * Pagination
 */

export type FilterPagination = {
  offset?: number;
  limit?: number;
};

export type FilterPaginationConfig = {
  enable?: boolean;
  offset?: {
    min?: number;
    max?: number;
    default?: number;
  };
  limit?: {
    min?: number;
    max?: number;
    default?: number;
  };
};

/**
 * Sort
 */

export type FilterSort = {
  key: string;
  order?: 'ASC' | 'DESC';
};

export type FilterSortConfig = {
  key: string;
  defaultOrder?: 'ASC' | 'DESC';
};

export type FilterSortsConfig = {
  enable?: boolean;
  items?: FilterSortConfig[];
};

/**
 * Root
 */

export type FilterFieldsConfig = {
  enable?: boolean;
  items?: FilterFieldConfig[];
};

export type Filter = {
  fields?: FilterField[];
  pagination?: FilterPagination;
  sorts?: FilterSort[];
};

export type FilterConfig = {
  fields?: FilterFieldsConfig;
  pagination?: FilterPaginationConfig;
  sorts?: FilterSortsConfig;
};
