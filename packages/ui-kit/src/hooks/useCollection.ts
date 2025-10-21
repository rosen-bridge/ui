import { useCallback, useMemo, useState } from 'react';

import { Selected, SortValue } from '../components';
import { type Filters } from '../components/common/smartSearch/server';

const OPERATOR_MAP = {
  'is': '=',
  'not': '!=',
  'is-not-one-of': '!=',
  'is-one-of': '=',
  'greater-than-or-equal': '>=',
  'less-than-or-equal': '<=',
  'contains': '*=',
  'startsWith': '^=',
  'endsWith': '$=',
}

export const useCollection = () => {
  const [fields, setFields] = useState<Selected[]>([]);

  const [pageIndex, setPageIndex] = useState<number>();

  const [pageSize, setPageSize] = useState<number>();

  const [sort, setSort] = useState<SortValue>();

  const filters = useMemo<Filters>(() =>{
    const filters: Filters = {
      fields: [],
      sorts: []
    }

    filters.fields = fields.map((field) => ({
      key: field.flow,
      operator: field.operator as any,
      value: field.value,
    }))

    if (typeof pageSize === 'number') {
      filters.pagination = {};
      filters.pagination.limit = pageSize;
    }

    if (typeof pageSize === 'number' && typeof pageIndex === 'number') {
      filters.pagination = {};
      filters.pagination.offset = pageSize * pageIndex;
    }

    if (sort?.key) {
      filters.sorts.push({
        key: sort.key,
        order: sort.order
      })
    }

    return filters;
  },[fields, pageIndex, pageSize, sort]);

  const params = useMemo<URLSearchParams | undefined>(() => {
    const urlSearchParams = new URLSearchParams();

    if (typeof filters.pagination?.limit === 'number') {
      urlSearchParams.set('limit', String(filters.pagination.limit));
    }

    if (typeof filters.pagination?.offset === 'number') {
      urlSearchParams.set('offset', String(filters.pagination.offset));
    }

    if (filters.search?.query) {
      urlSearchParams.set('search', filters.search.query);
    }
    
    if (filters.search?.in?.length) {
      urlSearchParams.set('in', filters.search.in.join(','));
    }

    if (filters.sorts.length) {
      const raw = filters.sorts.map((sort) => {
        return sort.order ? `${sort.key}-${sort.order}` : sort.key
      }).join(',');
      urlSearchParams.set('sorts', raw);
    }

    for (const field of filters.fields) {
      const isArray = Array.isArray(field.value);

      const operator = OPERATOR_MAP[field.operator as keyof typeof OPERATOR_MAP][0];

      const key = `${field.key}${ isArray ? '[]' : ''}${operator}`;

      const value = isArray ? [field.value].flat().join(',') : String(field.value);

      urlSearchParams.set(key, value);
    }

    if (!urlSearchParams.size) return;

    return urlSearchParams;
  }, [filters]);

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
