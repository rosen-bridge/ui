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
