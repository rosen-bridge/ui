import { useCallback, useMemo, useState } from 'react';

import { Selected, SortValue } from '../components';

const OPERATOR_MAP = {
  'is': '',
  'not': '!',
  'isNotOneOf': '!',
  'isOneOf': '',
  'greaterThanOrEqual': '>',
  'lessThanOrEqual': '<',
  'contains': '*',
  'startsWith': '^',
  'endsWith': '$',
}

export const useCollection = () => {
  const [fields, setFields] = useState<Selected[]>([]);

  const [pageIndex, setPageIndex] = useState<number>();

  const [pageSize, setPageSize] = useState<number>();

  const [sort, setSort] = useState<SortValue>();

  const params = useMemo<string | undefined>(() => {
    const params: Record<string, string> = {};

    for (const field of fields) {
      const isArray = Array.isArray(field.value);

      const operator = OPERATOR_MAP[field.operator as keyof typeof OPERATOR_MAP];

      const key = `${field.flow}${ isArray ? '[]' : ''}${operator}`;

      const value = isArray ? [field.value].flat().join(',') : String(field.value);

      params[key] = value;
    }

    if (typeof pageSize === 'number') {
      params['limit'] = String(pageSize);
    }

    if (typeof pageSize === 'number' && typeof pageIndex === 'number') {
      params['offset'] = String(pageSize * pageIndex);
    }

    if (sort?.key) {
      params['sorts'] = sort.order ? `${sort.key}-${sort.order}` : sort.key;
    }

    if (!Object.keys(params).length) return;

    return Object
      .keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join('&');
  }, [fields, pageIndex, pageSize, sort]);

  const handleFieldsChange = useCallback((fields: Selected[]) => {
    setFields(fields);
    setPageIndex(0);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageIndex(0);
  }, []);

  return {
    params,

    fields,
    setFields: handleFieldsChange,

    pageIndex,
    setPageIndex,

    pageSize,
    setPageSize: handlePageSizeChange,

    sort,
    setSort,
  };
};
