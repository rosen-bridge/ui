import { FilterConfig } from "./types";

export const FILTER_FIELD_OPERATORS = [
  {
    key: 'excludes',
    symbol: '[]!', 
  },
  {
    key: 'includes',
    symbol: '[]', 
  },
  {
    key: 'greaterThanOrEqual',
    symbol: '>', 
  },
  {
    key: 'lessThanOrEqual',
    symbol: '<', 
  }, 
  {
    key: 'contains',
    symbol: '*',
  },
  {
    key: 'startsWith',
    symbol: '^',
  },
  {
    key: 'endsWith',
    symbol: '$',
  },
] as const; 
 
export const FILTER_CONFIG_DEFAULT: FilterConfig = {
  fields: {
    enable: false,
  },
  pagination: {
    enable: true,
    offset: {
      min: 0, 
      max: Infinity, 
      default: 0
    }, 
    limit: {
      min: 1, 
      max: 100, 
      default: 100
    }
  },
  sorts: {
    enable: true
  }
}

export const FILTER_FIELD_COLLECTION_OPERATORS = [
  'includes', 
  'excludes',
] as const;

export const FILTER_FIELD_NUMBER_OPERATORS = [ 
  'equal',
  'notEqual',
  'lessThanOrEqual',
  'greaterThanOrEqual',
] as const;

export const FILTER_FIELD_STRING_OPERATORS = [ 
  'equal',
  'notEqual',
  'startsWith',
  'contains',
  'endsWith',
] as const;
