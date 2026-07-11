import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { OPERATORS, Selected, SortValue, ViewToggleType } from '../components';
import { useFramework } from './useFramework';

type Options = {
  defaultPageIndex?: number;
  defaultPageSize?: number;
  defaultSortField?: string;
  defaultSortOrder?: 'ASC' | 'DESC';
  defaultView?: ViewToggleType;
  localStorageKey?: string;
};

const getInitialState = (search: string, options?: Options) => {
  const searchParams = new URLSearchParams(search);

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

  const fragment = window.location.hash.replace('#', '');

  const raw =
    window.localStorage.getItem(
      `rosen:collection:${options?.localStorageKey}`,
    ) || '';

  const view = ['grid', 'row'].includes(raw)
    ? (raw as ViewToggleType)
    : options?.defaultView;

  return {
    fields,
    fragment,
    pageIndex,
    pageSize,
    sort,
    view,
  };
};

export const useCollection = (options?: Options) => {
  const framework = useFramework();

  const syncing = useRef(false);

  const [fields, setFields] = useState<Selected[]>();

  const [pageIndex, setPageIndex] = useState<number>();

  const [pageSize, setPageSize] = useState<number>();

  const [sort, setSort] = useState<SortValue>();

  const [view, setView] = useState<ViewToggleType>();

  const [fragment, setFragment] = useState<string>();

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

  useEffect(() => {
    syncing.current = true;

    const next = getInitialState(framework.router.search, {
      defaultPageIndex: options?.defaultPageIndex,
      defaultPageSize: options?.defaultPageSize,
      defaultSortField: options?.defaultSortField,
      defaultSortOrder: options?.defaultSortOrder,
      defaultView: options?.defaultView,
      localStorageKey: options?.localStorageKey,
    });

    setFields(next.fields);
    setFragment(next.fragment);
    setPageIndex(next.pageIndex);
    setPageSize(next.pageSize);
    setSort(next.sort);
    setView(next.view);
  }, [
    framework.router.search,
    options?.defaultPageIndex,
    options?.defaultPageSize,
    options?.defaultSortField,
    options?.defaultSortOrder,
    options?.defaultView,
    options?.localStorageKey,
  ]);

  const handleFieldsChange = useCallback((fields?: Selected[]) => {
    setFields(fields);
    setPageIndex(0);
  }, []);

  const handlePageSizeChange = useCallback((size?: number) => {
    setPageSize(size);
    setPageIndex(0);
  }, []);

  const scrollIntoView = useCallback(() => {
    if (!fragment) return;

    const element = document.getElementById(fragment);

    if (!element) return;

    const rect = element.getBoundingClientRect();

    const inViewport =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth);

    if (inViewport) return;

    element.scrollIntoView({ behavior: 'smooth' });
  }, [fragment]);

  useEffect(() => {
    if (syncing.current) return;

    setView(view);

    if (!options?.localStorageKey) return;

    if (view) {
      window.localStorage.setItem(
        `rosen:collection:${options.localStorageKey}`,
        view,
      );
    } else {
      window.localStorage.removeItem(
        `rosen:collection:${options.localStorageKey}`,
      );
    }
  }, [options?.localStorageKey, view]);

  /**
   * WARNING:
   * This logic prevents a production infinite request loop.
   * Any change to query comparison must keep normalization intact.
   */
  useEffect(() => {
    if (syncing.current) {
      syncing.current = false;
      return;
    }

    const currentSearch = framework.router.search?.replace(/^\?/, '') || '';
    const nextSearch = query || '';

    const currentHash = window.location.hash || '';
    const nextHash = fragment ? `#${fragment}` : '';

    if (currentSearch === nextSearch && currentHash === nextHash) return;

    let url = framework.router.pathname;

    if (nextSearch) {
      url += `?${nextSearch}`;
    }

    if (fragment) {
      url += `#${fragment}`;
    }

    framework.router.push(url);
  }, [query, fragment, framework.router]);

  useEffect(() => {
    const update = () => {
      const fragment = window.location.hash.replace('#', '');

      setFragment(fragment);
    };

    window.addEventListener('hashchange', update);

    return () => window.removeEventListener('hashchange', update);
  }, []);

  useEffect(scrollIntoView, [scrollIntoView]);

  return useMemo(
    () => ({
      query,

      scrollIntoView,

      fields,
      setFields: handleFieldsChange,

      fragment,
      setFragment,

      pageIndex,
      setPageIndex,

      pageSize,
      setPageSize: handlePageSizeChange,

      sort,
      setSort,

      view,
      setView,
    }),
    [
      query,

      scrollIntoView,

      fields,
      handleFieldsChange,

      fragment,
      setFragment,

      pageIndex,
      setPageIndex,

      pageSize,
      handlePageSizeChange,

      sort,
      setSort,

      view,
      setView,
    ],
  );
};
