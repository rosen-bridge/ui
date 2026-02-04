import { useCallback, useMemo, useState } from 'react';

import { OPERATORS, Selected, SortValue } from '../components';

type Options = {
  searchParams?: string;
  defaultPageIndex?: number;
  defaultPageSize?: number;
  defaultSortField?: string;
  defaultSortOrder?: 'ASC' | 'DESC';
};

const getInitialState = (options?: Options) => {
  const searchParams = new URLSearchParams(options?.searchParams);

  const limitRaw = searchParams.get('limit');
  searchParams.delete('limit');

  const offsetRaw = searchParams.get('offset');
  searchParams.delete('offset');

  const sortRaw = searchParams.get('sort');
  searchParams.delete('sort');

  const limit = limitRaw === null ? options?.defaultPageSize : Number(limitRaw);
  const offset = offsetRaw === null ? undefined : Number(offsetRaw);

  const pageSize = typeof limit === 'number' ? limit : options?.defaultPageSize;

  const pageIndex =
    typeof offset === 'number' && typeof pageSize === 'number'
      ? Math.floor(offset / pageSize)
      : options?.defaultPageIndex;

  const sortParam = sortRaw?.split('-');

  const sortField = sortParam?.at(0) ?? options?.defaultSortField;

  const sortOrder = (sortParam?.at(1) ?? options?.defaultSortOrder) as
    | 'ASC'
    | 'DESC'
    | undefined;

  const sort = sortField ? { key: sortField, order: sortOrder } : undefined;

  const operators = OPERATORS.sort((a, b) => b.symbol.length - a.symbol.length);

  const fields = Array.from(searchParams.entries())
    .map(([key, value]) => {
      const operator = operators.find((operator) =>
        key.endsWith(operator.symbol),
      );

      if (!operator) return;

      const name = operator.symbol.length
        ? key.slice(0, -operator.symbol.length)
        : key;

      let parsed: string | number | boolean | (string | number | boolean)[];

      switch (operator.value) {
        case 'is-one-of':
        case 'is-not-one-of':
          parsed = value.split(',');
          break;
        case 'is':
        case 'not':
        case 'contains':
        case 'startsWith':
        case 'endsWith':
          parsed = value;
          break;
        case 'less-than-or-equal':
        case 'greater-than-or-equal':
          parsed = Number(value);
          break;
        default:
          return;
      }

      return {
        flow: name,
        operator: operator.value,
        value: parsed,
      } as Selected;
    })
    .filter((field) => !!field);

  return {
    fields,
    pageIndex,
    pageSize,
    sort,
  };
};

export const useCollection = (options?: Options) => {
  const [init] = useState(() => getInitialState(options));

  const [fields, setFields] = useState<Selected[] | undefined>(init.fields);

  const [pageIndex, setPageIndex] = useState<number | undefined>(
    init.pageIndex,
  );

  const [pageSize, setPageSize] = useState<number | undefined>(init.pageSize);

  const [sort, setSort] = useState<SortValue | undefined>(init.sort);

  const query = useMemo<string | undefined>(() => {
    const params: Record<string, string> = {};

    for (const field of fields || []) {
      const operator = OPERATORS.find(
        (OPERATOR) => OPERATOR.value === field.operator,
      );

      if (!operator) continue;

      const key = `${field.flow}${operator.symbol}`;

      const value = Array.isArray(field.value)
        ? [field.value].flat().join(',')
        : String(field.value);

      params[key] = value;
    }

    if (typeof pageSize === 'number') {
      params['limit'] = String(pageSize);
    }

    if (typeof pageSize === 'number' && typeof pageIndex === 'number') {
      params['offset'] = String(pageSize * pageIndex);
    }

    if (sort?.key) {
      params['sort'] = sort.order ? `${sort.key}-${sort.order}` : sort.key;
    }

    if (!Object.keys(params).length) return;

    return Object.keys(params)
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

  const handleSortChange = useCallback((sort: SortValue | undefined) => {
    setSort(sort);
  }, []);

  return {
    query,

    fields,
    setFields: handleFieldsChange,

    pageIndex,
    setPageIndex,

    pageSize,
    setPageSize: handlePageSizeChange,

    sort,
    setSort: handleSortChange,
  };
};
