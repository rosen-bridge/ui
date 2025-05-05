import Joi from 'joi';

const OPERATORS = ['==', '!=', '<=', '>=', '*=', '^=', '$='] as const;

const SEARCH_QUERY_KEY = 'search';

const SEARCH_IN_QUERY_KEY = 'in';

const SORT_QUERY_KEY = 'sort';

type Fields = {
  key: string;
  operator: (typeof OPERATORS)[number];
  value: boolean | number | string | (number | string)[];
};

type Sort = {
  key?: string;
  order?: 'ASC' | 'DESC';
};

type Search = {
  query?: string;
  in?: string;
};

type Pagination = {
  offset: number;
  limit: number;
};

export type Filters = {
  fields: Fields[];
  pagination: Pagination;
  search?: Search;
  sort?: Sort;
};

export type FiltersRaw = {
  fields?: Fields[];
  pagination?: Partial<Pagination>;
  search?: Partial<Search>;
  sort?: Partial<Sort>;
};

export const filtersSchema = Joi.object<Filters>({
  fields: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().required(),
        operator: Joi.string()
          .valid(...OPERATORS)
          .required(),
        value: Joi.alternatives(
          Joi.boolean(),
          Joi.number(),
          Joi.string(),
          Joi.array().items(Joi.alternatives(Joi.number(), Joi.string())),
        ).required(),
      }),
    )
    .default([]),
  pagination: Joi.object({
    offset: Joi.number().min(0).default(0),
    limit: Joi.number().min(1).max(100).default(20),
  }).default({}),
  search: Joi.object({
    query: Joi.string(),
    in: Joi.string(),
  }),
  sort: Joi.object({
    key: Joi.string().required(),
    order: Joi.string().valid('ASC', 'DESC'),
  }),
});

export const extractFiltersFromSearchParams = (
  searchParams: URLSearchParams,
): FiltersRaw => {
  const filters: FiltersRaw = {};

  if (searchParams.has(SEARCH_IN_QUERY_KEY)) {
    filters.search ||= {};
    filters.search.in = searchParams.get(SEARCH_IN_QUERY_KEY)!;
    searchParams.delete(SEARCH_IN_QUERY_KEY);
  }

  if (searchParams.has('limit')) {
    filters.pagination ||= {};
    filters.pagination.limit = +searchParams.get('limit')!;
    searchParams.delete('limit');
  }

  if (searchParams.has('offset')) {
    filters.pagination ||= {};
    filters.pagination.offset = +searchParams.get('offset')!;
    searchParams.delete('offset');
  }

  if (searchParams.has(SEARCH_QUERY_KEY)) {
    filters.search ||= {};
    filters.search.query = searchParams.get(SEARCH_QUERY_KEY)!;
    searchParams.delete(SEARCH_QUERY_KEY);
  }

  if (searchParams.has(SORT_QUERY_KEY)) {
    const raw = searchParams.get(SORT_QUERY_KEY)!;

    filters.sort ||= { key: raw };

    if (raw.endsWith('-ASC')) {
      filters.sort.key = raw.replace('-ASC', '');
      filters.sort.order = 'ASC';
    }

    if (raw.endsWith('-DESC')) {
      filters.sort.key = raw.replace('-DESC', '');
      filters.sort.order = 'DESC';
    }

    searchParams.delete(SORT_QUERY_KEY);
  }

  searchParams.forEach((value, key) => {
    const isArray = key.endsWith('[]') || key.slice(0, -1).endsWith('[]');

    const operator =
      OPERATORS.find((operator) => key.at(-1) === operator.at(0)) || '==';

    const name = (key + '=')
      .split(`${isArray ? '[]' : ''}${operator.at(0)}`)
      .at(0)!;

    filters.fields ||= [];

    filters.fields.push({
      key: name,
      operator,
      value: isArray ? value.split(',') : value,
    });
  });

  return filters;
};

export const filtersToTypeorm = (
  filters: Filters,
  searchFields: string[],
  mapper: (key: string) => string,
) => {
  const sections: string[] = [];

  for (const field of filters.fields) {
    const key = mapper(field.key);

    const values = [field.value]
      .flat()
      .map((value) => `'${value}'`)
      .join(', ');

    switch (field.operator) {
      case '!=': {
        sections.push(`(${key} NOT IN (${values}))`);
        break;
      }
      case '<=': {
        sections.push(`(${key} <= ${field.value})`);
        break;
      }
      case '==': {
        sections.push(`(${key} IN (${values}))`);
        break;
      }
      case '>=': {
        sections.push(`(${key} >= ${field.value})`);
        break;
      }
      case '*=': {
        sections.push(`(${key} ILIKE '%${field.value}%')`);
        break;
      }
      case '^=': {
        sections.push(`(${key} ILIKE '${field.value}%')`);
        break;
      }
      case '$=': {
        sections.push(`(${key} ILIKE '%${field.value}')`);
        break;
      }
    }
  }

  if (filters.search?.query) {
    const fields = filters.search.in ? [filters.search.in] : searchFields;

    const query = fields
      .map((field) => `(${mapper(field)} ILIKE '%${filters.search?.query}%')`)
      .join(' OR ');

    sections.push(`(${query})`);
  }

  const where = sections.join(' AND ');

  const sort = filters.sort?.key
    ? Object.assign({}, filters.sort, { key: mapper(filters.sort.key) })
    : filters.sort;

  return { sort, where };
};
